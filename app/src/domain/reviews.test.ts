import { describe, expect, it } from 'vitest';
import { activities, questions, UNITS } from './content';
import { advanceSession, answerQuestion, beginSession, createProfile, parseProfile } from './progress';
import { advanceReview, answerReview, beginReview, completeReview, pendingReviews, questionSource, recordLearningAnswer } from './reviews';
import type { Profile } from './types';

const now = new Date(2026, 10, 23, 14);
const vocab = questions(UNITS[0], activities(UNITS[0])[0], 'id')[10];
const quiz = questions(UNITS[0], activities(UNITS[0]).find(a => a.kind === 'quiz')!, 'id')[0];
const speech = questions(UNITS[0], activities(UNITS[0]).find(a => a.kind === 'dialogue')!, 'id')[0];

describe('durable targeted review', () => {
  it('queues an actual lesson mistake and recovers it after serialization', () => {
    let p = beginSession(createProfile(now), 1, 'vocab-1');
    const bank = questions(UNITS[0], activities(UNITS[0])[0], 'id');
    for (const q of bank.slice(0, 10)) p = advanceSession(answerQuestion(p, q, true));
    p = answerQuestion(p, vocab, false, false, now);
    expect(pendingReviews(p).map(s => s.question.id)).toEqual([vocab.id]);
    const restored = parseProfile(JSON.parse(JSON.stringify(p)), now);
    expect(restored.reviews[vocab.id]).toMatchObject({ reason: 'incorrect', failures: 1, lastAttemptDay: '2026-11-23' });
    expect(answerQuestion(restored, vocab, false, false, now)).toBe(restored);
  });
  it('keeps the original lesson checkpoint, saves pending review feedback, and credits a corrected question only once', () => {
    const lesson = beginSession(createProfile(now), 1, 'vocab-1');
    let p = beginReview(recordLearningAnswer(lesson, vocab.id, false, false, false, now));
    p = answerReview(p, vocab.id, true, false, now);
    expect(p.session).toBe(lesson.session);
    expect(p.reviews[vocab.id]).toBeUndefined(); expect(p.xp).toBe(5); expect(p.mastery[vocab.word!.idKey]).toBe(1);
    p = parseProfile(JSON.parse(JSON.stringify(p)), now);
    expect(p.reviewSession?.answers[0]).toMatchObject({ correct: true });
    expect(answerReview(p, vocab.id, true)).toBe(p);
    p = completeReview(advanceReview(p)); expect(p.reviewSession).toBeNull();
    p = beginReview(recordLearningAnswer(p, vocab.id, false, false, false, now));
    p = answerReview(p, vocab.id, true, false, now);
    expect(p.xp).toBe(5); expect(p.mastery[vocab.word!.idKey]).toBe(1);
  });
  it('never changes exam scores, rewards or level gates when an exam mistake is reviewed', () => {
    let p: Profile = { ...createProfile(now), dates: 30, bestScores: { '1': 70 } };
    p = recordLearningAnswer(p, quiz.id, false, false, false, now);
    p = answerReview(beginReview(p), quiz.id, true, false, now);
    expect(p.bestScores[1]).toBe(70); expect(p.dates).toBe(30); expect(p.xp).toBe(0); expect(p.rewardedUnits).toEqual([]); expect(p.mastery).toEqual({});
  });
  it('keeps skipped speech queued through a review skip and removes it only after a successful answer', () => {
    let p = beginReview(recordLearningAnswer(createProfile(now), speech.id, false, true, false, now));
    p = answerReview(p, speech.id, false, true, now);
    expect(p.reviews[speech.id]).toMatchObject({ reason: 'speech-skipped', failures: 2 }); expect(p.xp).toBe(0);
    p = completeReview(advanceReview(p));
    p = answerReview(beginReview(p), speech.id, true, false, now);
    expect(p.reviews[speech.id]).toBeUndefined(); expect(p.xp).toBe(5);
  });
  it('freezes the review question order so resolving one entry cannot skip the next', () => {
    let p = recordLearningAnswer(createProfile(now), vocab.id, false, false, false, now);
    p = beginReview(recordLearningAnswer(p, quiz.id, false, false, false, now));
    const ids = p.reviewSession!.questionIds;
    p = answerReview(p, ids[0], true, false, now);
    p = advanceReview(parseProfile(JSON.parse(JSON.stringify(p)), now));
    expect(p.reviewSession!.questionIds[p.reviewSession!.cursor]).toBe(ids[1]);
    expect(pendingReviews(p)).toHaveLength(1);
    expect(questionSource(ids[1], 'en')?.question.id).toBe(ids[1]);
  });
  it('migrates old v1 backups without discarding progress and filters damaged review payloads', () => {
    const legacy = { ...createProfile(now), dates: 60, xp: 100 } as Record<string, unknown>;
    delete legacy.reviews; delete legacy.reviewSession;
    const p = parseProfile(legacy, now);
    expect(p.dates).toBe(60); expect(p.xp).toBe(100); expect(p.reviews).toEqual({}); expect(p.reviewSession).toBeNull();
    const damaged = parseProfile({ ...legacy, reviews: { fake: { reason: 'incorrect', failures: 1, lastAttemptDay: '2026-11-23' }, [vocab.id]: { reason: 'incorrect', failures: Infinity, lastAttemptDay: '2026-11-23' }, [speech.id]: { reason: 'speech-skipped', failures: 1, lastAttemptDay: '2026-02-31' } }, reviewSession: { questionIds: [vocab.id, vocab.id], cursor: 100, answers: [] } }, now);
    expect(Object.keys(damaged.reviews)).toEqual([vocab.id]); expect(damaged.reviews[vocab.id].failures).toBe(1); expect(damaged.reviewSession).toBeNull();
  });
  it('recovers mistakes from an active legacy session and rejects bogus review actions', () => {
    const bank = questions(UNITS[0], activities(UNITS[0])[0], 'id');
    let p = beginSession(createProfile(now), 1, 'vocab-1');
    for (const q of bank.slice(0, 10)) p = advanceSession(answerQuestion(p, q, true));
    p = answerQuestion(p, vocab, false, false, now);
    const legacy = { ...p } as Record<string, unknown>; delete legacy.reviews; delete legacy.reviewSession;
    const migrated = parseProfile(legacy, now);
    expect(migrated.reviews[vocab.id].reason).toBe('incorrect');
    expect(answerReview(migrated, 'fake', true)).toBe(migrated);
    const active = beginReview(migrated);
    expect(answerReview(active, quiz.id, true)).toBe(active); expect(completeReview(active)).toBe(active);
  });
});
