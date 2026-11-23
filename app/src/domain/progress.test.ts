import { describe, expect, it } from 'vitest';
import { UNITS, activities, activityKey, questions } from './content';
import { advanceSession, answerQuestion, availableHints, beginSession, buyHint, completeSession, createProfile, equipMascot, isActivityUnlocked, localDay, masteryPct, openChest, parseProfile, purchase, streak, useHint } from './progress';
import type { Profile, Unit } from './types';
import { matchSpeech, normalizeArabic, pickArabicVoice } from './speech';

const today = new Date(2026, 10, 23, 14);
function finish(p: Profile, unit: Unit, id: string, wrong = 0) {
  const activity = activities(unit).find(a => a.id === id)!;
  let next = beginSession(p, unit.id, id);
  for (const [i, q] of questions(unit, activity, p.language).entries()) next = advanceSession(answerQuestion(next, q, i >= wrong, q.kind === 'speak', today));
  return completeSession(next, today);
}
function learnUnit(p: Profile, unit: Unit) {
  let next = p;
  for (const a of activities(unit).filter(a => a.kind !== 'quiz')) next = finish(next, unit, a.id).profile;
  return next;
}

describe('original demo content', () => {
  it('contains the planned 30 / 35 / 35 lexical entries and complete runnable activities in both languages', () => {
    expect(UNITS.map(u => u.words.length)).toEqual([30, 35, 35]);
    const ids = new Set<string>();
    for (const unit of UNITS) for (const lang of ['id', 'en'] as const) {
      const list = activities(unit);
      expect(list.filter(a => a.kind === 'vocabulary').flatMap(a => a.words!)).toEqual(unit.words);
      expect(list.filter(a => a.kind === 'vocabulary').every(a => a.words!.length >= 10 && a.words!.length <= 15)).toBe(true);
      for (const activity of list) for (const q of questions(unit, activity, lang)) {
        if (lang === 'id') { expect(ids.has(q.id), q.id).toBe(false); ids.add(q.id); }
        expect(q.prompt.ar).toBeTruthy();
        if (q.choices) { expect(q.choices.some(c => c.id === q.answer)).toBe(true); expect(new Set(q.choices.map(c => c.text)).size).toBe(q.choices.length); }
      }
    }
  });
});

describe('learning and rewards', () => {
  it('does not unlock the quiz or the next unit before prerequisites are met', () => {
    const p = createProfile(today), unit = UNITS[0];
    expect(beginSession(p, 2, 'vocab-1')).toBe(p);
    expect(beginSession(p, 1, 'quiz')).toBe(p);
    expect(isActivityUnlocked(p, unit, 'pattern')).toBe(false);
    const early = { ...p, mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])) };
    expect(isActivityUnlocked(early, unit, 'quiz')).toBe(false);
  });
  it('can complete all three units, master all vocabulary, unlock the camel and receive the final skin', () => {
    let p = createProfile(today);
    for (const unit of UNITS) {
      p = learnUnit(p, unit);
      expect(masteryPct(p, unit)).toBe(100);
      expect(isActivityUnlocked(p, unit, 'quiz')).toBe(true);
      p = openChest(p, unit.id);
      const result = finish(p, unit, 'quiz');
      expect(result.reward).toMatchObject({ firstPass: true, dates: 50, score: 100, stars: 3 });
      p = result.profile;
    }
    expect(p.rewardedUnits).toEqual([1, 2, 3]);
    expect(p.dates).toBe(180);
    expect(p.ownedAnimals).toContain('camel');
    expect(p.ownedSkins).toContain('sailor');
    expect(Object.values(p.mastery).filter(n => n === 3)).toHaveLength(100);
    expect(parseProfile(JSON.parse(JSON.stringify(p)), today)).toEqual(p);
  });
  it('gives neither duplicate currency nor duplicate mastery / XP when content is replayed', () => {
    const unit = UNITS[0];
    let p = learnUnit(createProfile(today), unit);
    p = openChest(p, 1); expect(openChest(p, 1)).toBe(p);
    p = finish(p, unit, 'quiz').profile;
    const repeat = finish(p, unit, 'quiz');
    expect(repeat.reward).toMatchObject({ firstPass: false, dates: 0 });
    expect(repeat.profile.dates).toBe(p.dates); expect(repeat.profile.xp).toBe(p.xp);
    const vocab = finish(p, unit, 'vocab-1').profile;
    expect(vocab.mastery).toEqual(p.mastery); expect(vocab.xp).toBe(p.xp);
  });
  it('requires 80% to pass and retains the best score after a later failed attempt', () => {
    let p = learnUnit(createProfile(today), UNITS[0]);
    const failed = finish(p, UNITS[0], 'quiz', 3);
    expect(failed.reward?.score).toBe(70); expect(failed.profile.rewardedUnits).toEqual([]); expect(failed.profile.dates).toBe(0);
    p = finish(failed.profile, UNITS[0], 'quiz', 2).profile;
    expect(p.bestScores[1]).toBe(80); expect(p.dates).toBe(30);
    expect(finish(p, UNITS[0], 'quiz', 4).profile.bestScores[1]).toBe(80);
  });
  it('resumes the exact pending feedback after serialization and never double credits a submitted answer', () => {
    let p = beginSession(createProfile(today), 1, 'vocab-1');
    const bank = questions(UNITS[0], activities(UNITS[0])[0], 'id');
    for (const q of bank.slice(0, 10)) p = advanceSession(answerQuestion(p, q, true));
    p = answerQuestion(p, bank[10], true);
    const restored = parseProfile(JSON.parse(JSON.stringify(p)), today);
    expect(restored.session?.cursor).toBe(10); expect(restored.session?.answers).toHaveLength(11);
    expect(answerQuestion(restored, bank[10], true)).toBe(restored);
    expect(advanceSession(restored).session?.cursor).toBe(11);
  });
  it('does not allow an incomplete session to claim a completion reward', () => {
    const p = beginSession(createProfile(today), 1, 'vocab-1');
    expect(completeSession(p).profile).toBe(p);
    expect(openChest(p, 1)).toBe(p);
  });
});

describe('hints, inventory, calendar and storage', () => {
  it('limits one hint per question, resets free hints on a new local day, and never allows hints during a quiz', () => {
    let p = beginSession(createProfile(today), 1, 'vocab-1');
    p = useHint(p, today); expect(availableHints(p, today)).toBe(2); expect(useHint(p, today)).toBe(p);
    const tomorrow = new Date(2026, 10, 24, 1);
    expect(availableHints(p, tomorrow)).toBe(3);
    const quiz = { ...p, session: { ...p.session!, activityId: 'quiz' } };
    expect(useHint(quiz, today)).toBe(quiz);
  });
  it('charges ten dates for each extra hint, limits purchases to five, and rejects overdrafts', () => {
    expect(buyHint(createProfile(today), today).dates).toBe(0);
    let p = { ...createProfile(today), dates: 100 };
    for (let i = 0; i < 8; i++) p = buyHint(p, today);
    expect(p.dates).toBe(50); expect(p.hintsPurchased).toBe(5); expect(availableHints(p, today)).toBe(8);
  });
  it('rejects unknown / locked purchases and equipment, and charges each item only once', () => {
    const p = { ...createProfile(today), dates: 220 };
    expect(purchase(p, 'skin', 'goldbisht')).toBe(p);
    expect(equipMascot(p, { ...p.mascot, animal: 'oryx' })).toBe(p);
    const bought = purchase(p, 'animal', 'cat'); expect(bought.dates).toBe(20);
    expect(purchase(bought, 'animal', 'cat')).toBe(bought);
    expect(equipMascot(bought, { animal: 'cat' }).mascot.animal).toBe('cat');
    expect(purchase(bought, 'skin', 'sailor')).toBe(bought);
  });
  it('counts local consecutive activity days, accepts a streak continuing from yesterday, and expires older streaks', () => {
    const p = { ...createProfile(today), activityDays: ['2026-11-20', '2026-11-21', '2026-11-22'] };
    expect(streak(p, today)).toBe(3);
    expect(streak(p, new Date(2026, 10, 24))).toBe(0);
    expect(streak({ ...p, activityDays: [...p.activityDays, localDay(today)] }, today)).toBe(4);
  });
  it('sanitizes malformed stored values and refuses unsupported profile versions', () => {
    const p = parseProfile({ version: 1, dates: -10, xp: Infinity, mascot: { animal: '<script>', color: 'constructor' }, mastery: { '__proto__': 3, 'u1-w1': 100, 'u9-w9': 1 }, activityDays: ['2026-02-31', 1, '2026-11-23'], completedActivities: ['u1:vocab-1', 'u999:quiz'], session: { unitId: 1, activityId: 'quiz', cursor: 10000, answers: [{ questionId: 'fake', correct: true }] } }, today);
    expect(p.dates).toBe(0); expect(p.xp).toBe(0); expect(p.mascot.animal).toBe('hudhud');
    expect(p.mastery).toEqual({ 'u1-w1': 3 }); expect(p.activityDays).toEqual(['2026-11-23']);
    expect(p.completedActivities).toEqual([activityKey(1, 'vocab-1')]); expect(p.session?.cursor).toBe(0);
    expect(() => parseProfile({ version: 2 })).toThrow();
  });
});

describe('speech transcript matching', () => {
  it('prefers an on-device Arabic voice and never chooses a remote voice while offline', () => {
    const remote = { lang: 'ar-SA', localService: false }, local = { lang: 'ar-EG', localService: true }, english = { lang: 'en-US', localService: true };
    expect(pickArabicVoice([remote, english, local], true)).toBe(local);
    expect(pickArabicVoice([remote, english], false)).toBeUndefined();
    expect(pickArabicVoice([english, remote], true)).toBe(remote);
    expect(pickArabicVoice([remote, local], false)).toBe(local);
  });
  it('normalizes harakat, punctuation and common Arabic letter variants without accepting empty audio', () => {
    expect(normalizeArabic('أَنَا مِنْ إِنْدُونِيسِيَا.')).toBe('انا من اندونيسيا');
    expect(matchSpeech('أَنَا مِنْ إِنْدُونِيسِيَا.', 'انا من اندونيسيا').passed).toBe(true);
    expect(matchSpeech('مَرْحَبًا', '').passed).toBe(false);
    expect(matchSpeech('', '').passed).toBe(false);
  });
  it('rejects a dropped negation or reordered sentence, even when most words are recognized', () => {
    expect(matchSpeech('أَنَا لَا أَفْهَمُ هَذِهِ الْكَلِمَةَ', 'انا افهم هذه الكلمة').passed).toBe(false);
    expect(matchSpeech('أَنَا مِنْ إِنْدُونِيسِيَا', 'اندونيسيا من انا').passed).toBe(false);
  });
});
