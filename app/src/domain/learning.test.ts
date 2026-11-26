import { describe, expect, it } from 'vitest';
import { activities, questions, SHAHARIL_UNITS, UNITS, unitsFor } from './content';
import { advanceSession, answerQuestion, beginSession, completeSession, createProfile, parseProfile } from './progress';
import { answerReview, beginReview, questionSource } from './reviews';
import { filterVocabulary, vocabularySessionId } from './vocabulary';
import type { Profile } from './types';
import { hasRepeatedMistakes } from './hints';
import shaharil from './shaharil.json' with { type: 'json' };

const now = new Date(2026, 10, 23, 14), unit = UNITS[0], quiz = activities(unit).find(a => a.kind === 'quiz')!;
const eligible = () => ({ ...createProfile(now), completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])) });

describe('versioned mixed quizzes', () => {
  it('provides eight vocabulary questions and two sentence tasks for every demo unit and language', () => {
    for (const u of UNITS) for (const lang of ['id', 'en'] as const) {
      const q = activities(u).find(a => a.kind === 'quiz')!, bank = questions(u, q, lang);
      expect(bank).toHaveLength(10); expect(bank.filter(q => q.kind === 'order')).toHaveLength(2);
      expect(bank.filter(q => q.word)).toHaveLength(8);
      expect(new Set(bank.map(q => q.id)).size).toBe(10);
      expect(questions(u, q, lang, 1).every(q => q.kind !== 'order')).toBe(true);
    }
  });
  it('restores legacy feedback and finishes the original quiz before a later attempt uses the mixed bank', () => {
    const old = questions(unit, quiz, 'id', 1);
    const p = parseProfile({ ...eligible(), dates: 10, session: { unitId: 1, activityId: 'quiz', cursor: 8, answers: old.slice(0, 9).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false, wordId: q.word?.idKey })), hintAt: null } }, now);
    expect(p.session).toMatchObject({ questionVersion: 1, cursor: 8 });
    expect(p.session!.answers[8].questionId).toBe(old[8].id);
    let next = advanceSession(p);
    next = advanceSession(answerQuestion(next, old[9], true, false, now));
    const result = completeSession(next, now);
    expect(result.reward).toMatchObject({ score: 100, dates: 50 }); expect(result.profile.dates).toBe(60);
    const fresh = beginSession(result.profile, 1, 'quiz');
    expect(fresh.session!.questionVersion).toBe(2);
    const mixed = questions(unit, quiz, 'id');
    expect(mixed[8].kind).toBe('order');
    let repeated = fresh;
    for (const q of mixed) repeated = advanceSession(answerQuestion(repeated, q, true, false, now));
    expect(completeSession(repeated, now).profile.dates).toBe(60);
  });
  it('retains saved legacy mistakes for questions no longer used by a new quiz', () => {
    const old = questions(unit, quiz, 'id', 1)[9];
    const restored = parseProfile({ ...eligible(), bestScores: { '1': 70 }, reviews: { [old.id]: { reason: 'incorrect', failures: 1, lastAttemptDay: '2026-11-23' } } }, now);
    expect(questionSource(old.id, 'en')?.question.word?.idKey).toBe(old.word!.idKey);
    expect(restored.reviews[old.id]).toBeDefined();
    const corrected = answerReview(beginReview(restored), old.id, true, false, now);
    expect(corrected.reviews[old.id]).toBeUndefined(); expect(corrected.bestScores[1]).toBe(70); expect(corrected.rewardedUnits).toEqual([]); expect(corrected.dates).toBe(0);
  });
  it('refuses an unknown question-bank version instead of grading it with a different bank', () => {
    expect(() => parseProfile({ ...eligible(), session: { unitId: 1, activityId: 'quiz', questionVersion: 99, cursor: 0, answers: [] } }, now)).toThrow('Unsupported question version');
  });
});

describe('vocabulary browsing and hint eligibility', () => {
  it('finds Arabic without harakat, both translation languages, and Arabic / Persian numerals', () => {
    expect(filterVocabulary(unit, {}, 'السلام', 'all').map(w => w.idKey)).toEqual(['u1-w1', 'u1-w2', 'u1-w20']);
    expect(filterVocabulary(unit, {}, 'GOOD MORNING', 'all')).toHaveLength(2);
    expect(filterVocabulary(unit, {}, 'selamat pagi', 'all')).toHaveLength(2);
    expect(filterVocabulary(unit, {}, 'laki laki', 'all').some(w => w.idKey === 'u1-w9')).toBe(true);
    expect(filterVocabulary(UNITS[2], {}, '٢٠', 'all').map(w => w.idKey)).toEqual(['u3-w20']);
    expect(filterVocabulary(UNITS[2], {}, '۲۰', 'all').map(w => w.idKey)).toEqual(['u3-w20']);
  });
  it('filters by real mastery and connects each word to a session containing it', () => {
    const mastery = { 'u1-w1': 3, 'u1-w2': 1 };
    expect(filterVocabulary(unit, mastery, '', 'mastered').map(w => w.idKey)).toEqual(['u1-w1']);
    expect(filterVocabulary(unit, mastery, '', 'learning').map(w => w.idKey)).toEqual(['u1-w2']);
    expect(filterVocabulary(unit, mastery, '', 'new')).toHaveLength(28);
    expect(filterVocabulary(unit, mastery, 'السلام', 'mastered')).toHaveLength(1);
    for (const u of UNITS) for (const w of u.words) expect(activities(u).find(a => a.id === vocabularySessionId(u, w.idKey))?.words).toContain(w);
    expect(vocabularySessionId(unit, 'missing')).toBeNull();
  });
  it('offers help after two wrong answers, ignores study and skipped speech, and resets on success', () => {
    const base = beginSession(createProfile(now), 1, 'vocab-1').session!;
    const wrong = { questionId: 'u1-vocab-1-0', correct: false, skipped: false, hinted: false };
    expect(hasRepeatedMistakes({ ...base, answers: [wrong] })).toBe(false);
    expect(hasRepeatedMistakes({ ...base, answers: [wrong, { ...wrong, questionId: 'u1-vocab-1-study-1' }, { ...wrong, questionId: 'u1-dialogue-0', skipped: true }, { ...wrong, questionId: 'u1-vocab-1-1' }] })).toBe(true);
    expect(hasRepeatedMistakes({ ...base, answers: [wrong, wrong, { ...wrong, correct: true }] })).toBe(false);
    expect(hasRepeatedMistakes({ ...base, activityId: 'quiz', answers: [wrong, wrong] })).toBe(false);
    expect(hasRepeatedMistakes(null)).toBe(false);
  });
});


describe('Shaharil demo material', () => {
  it('provides specific Arabic reading questions with one answer and language-independent identities', () => {
    for (const source of shaharil) {
      const unit = SHAHARIL_UNITS[source.wahdah - 1];
      const reading = activities(unit).find(a => a.kind === 'reading')!;
      const arabic = questions(unit, reading, 'id'), english = questions(unit, reading, 'en');
      expect(new Set(arabic.map(q => q.prompt.ar)).size).toBe(5);
      source.qiraah.questions.forEach((item, index) => {
        expect(item.ar).toMatch(/[\u0600-\u06ff].*؟$/u);
        expect(item.options.filter(option => option.correct)).toHaveLength(1);
        expect(arabic[index].id).toBe(`u${unit.id}-s-reading-${item.id}`);
        expect(arabic[index].prompt.ar).toBe(item.ar);
        expect(arabic[index].prompt.id).not.toBe('Jawab pertanyaan ini.');
        expect(english[index].answer).toBe(arabic[index].answer);
        expect(english[index].choices?.map(c => c.id)).toEqual(arabic[index].choices?.map(c => c.id));
      });
    }
    expect(SHAHARIL_UNITS[0].reading.ar).toMatch(/^كَتَبَتْ نُورٌ/);
  });

  it('exposes three complete units with resolvable bilingual questions', () => {
    expect(SHAHARIL_UNITS.map(unit => unit.words.length)).toEqual([30, 34, 29]);
    for (const unit of SHAHARIL_UNITS) for (const lang of ['id', 'en'] as const) {
      const bank = activities(unit).flatMap(activity => questions(unit, activity, lang));
      expect(bank.filter(q => q.reading)).toHaveLength(5);
      expect(bank.filter(q => q.id.includes('-quiz-'))).toHaveLength(10);
      expect(new Set(bank.map(q => q.id)).size).toBe(bank.length);
      for (const q of bank) {
        expect(questionSource(q.id, lang)?.question).toEqual(q);
        if (q.choices) {
          expect(q.choices.some(choice => choice.id === q.answer)).toBe(true);
          expect(q.choices.every(choice => choice.text.length > 0)).toBe(true);
        }
      }
    }
  });

  it('preserves curriculum and the corresponding checkpoint after profile import', () => {
    for (const curriculum of [undefined, 'shaharil'] as const) {
      let profile: Profile = { ...createProfile(now), curriculum };
      const [unit] = unitsFor(profile);
      const [activity] = activities(unit);
      profile = beginSession(profile, unit.id, activity.id);
      const [q] = questions(unit, activity, 'id');
      profile = answerQuestion(profile, q, true, false, now);
      const restored = parseProfile(JSON.parse(JSON.stringify(profile)), now);
      expect(restored.curriculum).toBe(curriculum);
      expect(restored.session?.answers[0]?.questionId).toBe(q.id);
    }
  });
});
