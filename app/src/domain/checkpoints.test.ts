import { describe, expect, it } from 'vitest';
import { activities, questions, UNITS } from './content';
import { advanceSession, answerQuestion, beginSession, completeSession, createProfile, lessonCheckpoint, parseProfile, useHint } from './progress';
import { demoCompleted, savedLessons } from './checkpoints';
import { answerReview, beginReview, recordLearningAnswer } from './reviews';
import type { Profile } from './types';

const now = new Date(2026, 10, 23, 14), unit = UNITS[0];
const ready = (): Profile => ({ ...createProfile(now), completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])) });
const bank = (id: string, version: 1 | 2 = 2) => questions(unit, activities(unit).find(a => a.id === id)!, 'id', version);
const reload = (p: Profile) => parseProfile(JSON.parse(JSON.stringify(p)), now);

describe('independent lesson checkpoints', () => {
  it('switches between lessons with pending feedback and a used hint without repeating credit', () => {
    let p = beginSession(ready(), 1, 'vocab-1');
    for (const q of bank('vocab-1').slice(0, 10)) p = advanceSession(answerQuestion(p, q, true, false, now));
    p = answerQuestion(useHint(p, now), bank('vocab-1')[10], true, false, now);
    const original = p.session;
    p = beginSession(p, 1, 'pattern');
    expect(lessonCheckpoint(p, 1, 'vocab-1')).toEqual(original);
    p = answerQuestion(p, bank('pattern')[0], true, false, now);
    const pattern = p.session;
    p = beginSession(reload(p), 1, 'vocab-1');
    expect(p.session).toEqual(original); expect(p.session?.hintAt).toBe(10);
    expect(lessonCheckpoint(p, 1, 'pattern')).toEqual(pattern);
    expect(p.savedSessions['u1:vocab-1']).toBeUndefined();
    expect(p.xp).toBe(7); expect(p.hintsUsed).toBe(1);
    expect(answerQuestion(p, bank('vocab-1')[10], true, false, now)).toBe(p);
    p = beginSession(advanceSession(p), 1, 'pattern');
    expect(p.session).toEqual(pattern); expect(p.xp).toBe(7);
    expect(lessonCheckpoint(p, 1, 'vocab-1')?.cursor).toBe(11);
  });

  it('completes one lesson without deleting checkpoints for another lesson or awarding an early reward', () => {
    let p = beginSession(beginSession(ready(), 1, 'vocab-1'), 1, 'pattern');
    const saved = p.savedSessions;
    expect(completeSession(p).profile).toBe(p);
    for (const q of bank('pattern')) p = advanceSession(answerQuestion(p, q, true, false, now));
    const result = completeSession(p, now);
    expect(result.profile.session).toBeNull(); expect(result.profile.savedSessions).toEqual(saved);
    expect(result.reward).toBeNull(); expect(result.profile.dates).toBe(0);
    expect(beginSession(result.profile, 1, 'vocab-1').session?.cursor).toBe(0);
  });

  it('parks and resumes a legacy quiz using its original question bank and rewards', () => {
    const old = bank('quiz', 1);
    let p = parseProfile({ ...ready(), session: { unitId: 1, activityId: 'quiz', cursor: 8, answers: old.slice(0, 9).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false })), hintAt: null } }, now);
    p = beginSession(p, 1, 'vocab-1');
    expect(p.savedSessions['u1:quiz'].questionVersion).toBe(1);
    p = beginSession(reload(p), 1, 'quiz');
    expect(p.session).toMatchObject({ questionVersion: 1, cursor: 8 });
    p = advanceSession(answerQuestion(advanceSession(p), old[9], true, false, now));
    const result = completeSession(p, now);
    expect(result.reward).toMatchObject({ firstPass: true, score: 100, dates: 50 });
    expect(result.profile.savedSessions['u1:vocab-1']).toBeDefined();
    expect(beginSession(result.profile, 1, 'quiz').session?.questionVersion).toBe(2);
  });

  it('keeps review credit independent of the parked lesson and avoids crediting its pending answer twice', () => {
    const q = bank('vocab-1')[10];
    let p = beginSession(ready(), 1, 'vocab-1');
    for (const study of bank('vocab-1').slice(0, 10)) p = advanceSession(answerQuestion(p, study, true, false, now));
    p = beginSession(answerQuestion(p, q, false, false, now), 1, 'pattern');
    const checkpoint = p.savedSessions['u1:vocab-1'];
    p = answerReview(beginReview(p), q.id, true, false, now);
    expect(p.xp).toBe(5); expect(p.savedSessions['u1:vocab-1']).toEqual(checkpoint);
    p = beginSession(reload(p), 1, 'vocab-1');
    expect(p.session?.answers[10].correct).toBe(false);
    expect(answerQuestion(p, q, true, false, now)).toBe(p);
    expect(recordLearningAnswer(p, q.id, true, false, false, now).xp).toBe(5);
  });

  it('migrates old profiles, validates saved session keys, and keeps the active checkpoint authoritative', () => {
    const p = beginSession(ready(), 1, 'vocab-1'), legacy = { ...p } as Record<string, unknown>;
    delete legacy.savedSessions;
    expect(parseProfile(legacy, now).savedSessions).toEqual({});
    const parsed = parseProfile({ ...p, savedSessions: { 'u1:vocab-1': { ...p.session, cursor: 500 }, 'u1:pattern': p.session, fake: p.session, 'u1:reading': { unitId: 1, activityId: 'reading', cursor: 900, answers: [{ questionId: 'fake', correct: true, skipped: false, hinted: false }], hintAt: 0 } } }, now);
    expect(Object.keys(parsed.savedSessions)).toEqual(['u1:reading']);
    expect(parsed.savedSessions['u1:reading']).toMatchObject({ questionVersion: 1, cursor: 0, answers: [] });
    expect(parsed.session).toEqual(p.session);
    expect(beginSession(parsed, 2, 'vocab-1')).toBe(parsed);
    expect(() => parseProfile({ ...p, savedSessions: { 'u1:quiz': { unitId: 1, activityId: 'quiz', questionVersion: 99 } } }, now)).toThrow('Unsupported question version');
  });

  it('lists active and parked lessons with bounded positions, hiding checkpoints that cannot be opened', () => {
    let p = beginSession(beginSession(ready(), 1, 'vocab-1'), 1, 'pattern');
    const list = savedLessons(p);
    expect(list.map(item => item.activity.id)).toEqual(['pattern', 'vocab-1']);
    expect(list[0]).toMatchObject({ position: 1, total: bank('pattern').length });
    p = { ...p, session: { ...p.session!, cursor: bank('pattern').length }, savedSessions: { ...p.savedSessions, 'u2:vocab-1': { unitId: 2, activityId: 'vocab-1', questionVersion: 2, cursor: 0, answers: [], hintAt: null } } };
    expect(savedLessons(p)).toHaveLength(2);
    expect(savedLessons(p)[0].position).toBe(bank('pattern').length);
  });
});

describe('demo completion', () => {
  it('requires all three unit rewards, rather than a high score or the third unit alone', () => {
    expect(demoCompleted({ ...ready(), bestScores: { '1': 100, '2': 100, '3': 100 } })).toBe(false);
    expect(demoCompleted({ ...ready(), rewardedUnits: [3] })).toBe(false);
    expect(demoCompleted({ ...ready(), rewardedUnits: [1, 2, 3] })).toBe(true);
  });
});
