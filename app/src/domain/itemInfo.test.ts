import { describe, expect, it } from 'vitest';
import info from './itemInfo.json';
import { UNITS, activities, questions } from './content';
import { advanceSession, answerQuestion, availableHints, beginSession, buyHint, completeSession, createProfile, equipMascot, isActivityUnlocked, localDay, masteryPct, openChest, useHint } from './progress';
import type { Profile, Unit } from './types';

// Menjaga teks penjelasan item (Shaharil) tetap SESUAI mekanik app: bila angka di kode berubah, tes ini gagal dan teks perlu diperbarui.
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
const digits = (s: string) => s.match(/\d+/g) ?? [];

describe('penjelasan item = mekanik nyata', () => {
  it('5 item x (nama, kegunaan, cara mendapat), masing-masing Arab berharakat + id + en', () => {
    for (const item of ['xp', 'dates', 'streak', 'hint', 'mastery'] as const) for (const part of ['name', 'use', 'get'] as const) {
      const s = info[item][part];
      expect(s.ar, `${item}.${part}.ar`).toMatch(/[\u064B-\u0652]/);
      expect(s.id.length).toBeGreaterThan(3); expect(s.en.length).toBeGreaterThan(3);
    }
  });
  it('bintang (XP): +5 soal latihan pertama kali benar (+2 dengan tetes bantuan), +30 lulus ujian pertama kali; tidak bisa dibelanjakan', () => {
    expect(digits(info.xp.get.id)).toEqual(['5', '30']);
    const unit = UNITS[0], vocab = activities(unit)[0], bank = questions(unit, vocab, 'id'), at = bank.findIndex(x => x.kind !== 'study'), q = bank[at];
    let p = beginSession(createProfile(today), unit.id, vocab.id);
    p = { ...p, session: { ...p.session!, cursor: at } };
    expect(answerQuestion(p, q, true, false, today).xp).toBe(5);
    expect(answerQuestion(useHint(p, today), q, true, false, today).xp).toBe(2);
    const passed = finish(learnUnit(createProfile(today), unit), unit, 'quiz');
    expect(passed.reward).toMatchObject({ firstPass: true });
    expect(passed.profile.xp - learnUnit(createProfile(today), unit).xp).toBe(30);
  });
  it('kurma: +30 (+20 bila nilai ≥ 95) lulus ujian pertama kali, +10 dari peti; dipakai membeli tetes bantuan 10 per tetes', () => {
    expect(digits(info.dates.get.id)).toEqual(['30', '10']);
    const unit = UNITS[0], learned = learnUnit(createProfile(today), unit);
    expect(finish(learned, unit, 'quiz').reward!.dates).toBe(50);
    expect(finish(learned, unit, 'quiz', 1).reward!.dates).toBe(30);   // 90%
    expect(openChest(learned, unit.id).dates - learned.dates).toBe(10);
    const rich = { ...createProfile(today), dates: 100 };
    expect(buyHint(rich, today).dates).toBe(90);
  });
  it('tetes bantuan: 3 gratis per hari, tambahan 10 kurma per tetes, maksimal 5 tambahan per hari; tidak tersedia di ujian', () => {
    expect(digits(info.hint.get.id)).toEqual(['3', '10', '5']);
    expect(availableHints(createProfile(today), today)).toBe(3);
    let p = { ...createProfile(today), dates: 200 };
    for (let i = 0; i < 8; i++) p = buyHint(p, today);
    expect(availableHints(p, today)).toBe(8); expect(p.dates).toBe(150);   // hanya 5 terbeli
    const unit = UNITS[0], learned = learnUnit(createProfile(today), unit), quiz = beginSession(learned, unit.id, 'quiz');
    expect(useHint(quiz, today)).toBe(quiz);
    expect(digits(info.hint.use.id)).toEqual(['2', '5']);
  });
  it('lentera (hari beruntun): 7 hari membuka penyu', () => {
    expect(digits(info.streak.use.id)).toEqual(['7']);
    const days = (n: number) => Array.from({ length: n }, (_, i) => localDay(new Date(2026, 10, 23 - i)));
    const base = createProfile(today);
    expect(equipMascot({ ...base, activityDays: days(6) }, { animal: 'turtle' }, today).mascot.animal).toBe('hudhud');
    expect(equipMascot({ ...base, activityDays: days(7) }, { animal: 'turtle' }, today).mascot.animal).toBe('turtle');
  });
  it('tetes pengetahuan: kata dikuasai setelah 3 jawaban latihan benar; ujian terbuka mulai 80% kata dikuasai', () => {
    expect(digits(info.mastery.get.id)).toEqual(['3']); expect(digits(info.mastery.use.id)).toEqual(['80']);
    const unit = UNITS[0];
    let p = learnUnit(createProfile(today), unit);
    expect(masteryPct(p, unit)).toBe(100); expect(isActivityUnlocked(p, unit, 'quiz')).toBe(true);
    const half = Object.fromEntries(unit.words.map((w, i) => [w.idKey, i < Math.floor(unit.words.length * 0.8) - 1 ? 3 : 2]));
    p = { ...p, mastery: half };
    expect(masteryPct(p, unit)).toBeLessThan(80); expect(isActivityUnlocked(p, unit, 'quiz')).toBe(false);
  });
});