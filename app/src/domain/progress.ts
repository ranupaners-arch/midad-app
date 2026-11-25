import { validateMascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { UNITS, unitsFor, activities, activityKey, questions } from './content';
import type { Answer, Language, Profile, Question, Session, Unit } from './types';
import { dayNumber, localDay, validDay } from './calendar';
import { parseReviews, parseReviewSession, questionSource, recordLearningAnswer } from './reviews';
export { localDay } from './calendar';

export const STORAGE_KEY = 'midad.profile.v1';

export function createProfile(now = new Date()): Profile {
  return {
    version: 1, language: 'id', onboarded: false, mascot: validateMascotConfig({}), theme: 'system', translation: false, sound: true,
    dates: 0, xp: 0, activityDays: [], hintDay: localDay(now), hintsUsed: 0, hintsPurchased: 0,
    ownedAnimals: ['hudhud'], ownedSkins: ['none'], ownedItems: ['hand:none', 'hand:qalam', 'hand:inkpot', 'hand:book', 'head:none', 'neck:none'],
    completedActivities: [], creditedQuestions: [], mastery: {}, bestScores: {}, rewardedUnits: [], chestRewards: {}, session: null, savedSessions: {}, reviews: {}, reviewSession: null,
  };
}

const integer = (n: unknown, max = 1000000) => typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(0, Math.floor(n))) : 0;
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const strings = (value: unknown) => [...new Set(array(value).filter((v): v is string => typeof v === 'string'))];
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const activityKeys = UNITS.flatMap(u => activities(u).map(a => activityKey(u.id, a.id)));
const itemKeys = ['hand:none', 'hand:qalam', 'hand:inkpot', 'hand:book', 'hand:lantern', 'hand:dates', 'hand:dhow', 'hand:telescope', 'hand:scroll', 'head:none', 'head:kumma', 'head:mussar', 'head:peci', 'neck:none', 'neck:scarf'];
export const skinKeys = ['none', 'sailor', 'vest', 'batik', 'dishdasha', 'koko', 'nakhoda', 'scholar', 'goldbisht', 'nightink'];

function parseSession(raw: unknown, profile: Pick<Profile, 'language' | 'curriculum'>): Session | null {
  const { language } = profile;
  const s = record(raw), unit = unitsFor(profile).find(u => u.id === s.unitId);
  const activity = unit && activities(unit).find(a => a.id === s.activityId);
  if (!unit || !activity) return null;
  const questionVersion = s.questionVersion === undefined ? 1 : s.questionVersion;
  if (questionVersion !== 1 && questionVersion !== 2) throw new Error('Unsupported question version');
  const bank = questions(unit, activity, language, questionVersion), answers: Answer[] = [];
  for (const [index, value] of array(s.answers).entries()) {
    const a = record(value), q = bank[index];
    if (!q || a.questionId !== q.id || typeof a.correct !== 'boolean' || typeof a.skipped !== 'boolean' || typeof a.hinted !== 'boolean') break;
    answers.push({ questionId: q.id, correct: a.correct, skipped: a.skipped, hinted: a.hinted, ...(q.word ? { wordId: q.word.idKey } : {}) });
  }
  const cursor = Math.min(integer(s.cursor, bank.length), answers.length);
  return { unitId: unit.id, activityId: activity.id, questionVersion, cursor, answers: answers.slice(0, cursor + 1), hintAt: s.hintAt === cursor ? cursor : null };
}

export function parseProfile(raw: unknown, now = new Date()): Profile {
  const r = record(raw);
  if (r.version !== 1) throw new Error('Unsupported or damaged profile');
  const base = createProfile(now);
  const curriculum = r.curriculum === 'shaharil' ? 'shaharil' : undefined;
  const wordKeys = new Set(unitsFor({ curriculum }).flatMap(u => u.words.map(w => w.idKey)));
  const p: Profile = {
    ...base, curriculum, language: r.language === 'en' ? 'en' : 'id', onboarded: r.onboarded === true,
    mascot: validateMascotConfig(r.mascot), theme: r.theme === 'light' || r.theme === 'dark' ? r.theme : 'system',
    translation: r.translation === true, sound: r.sound !== false, dates: integer(r.dates), xp: integer(r.xp),
    activityDays: strings(r.activityDays).filter(validDay).sort(),
    hintDay: validDay(r.hintDay) ? r.hintDay : localDay(now), hintsUsed: integer(r.hintsUsed, 8), hintsPurchased: integer(r.hintsPurchased, 5),
    ownedAnimals: [...new Set(['hudhud', ...strings(r.ownedAnimals).filter(a => ['hudhud', 'cat', 'camel', 'turtle', 'oryx'].includes(a))])],
    ownedSkins: [...new Set(['none', ...strings(r.ownedSkins).filter(s => skinKeys.includes(s))])],
    ownedItems: [...new Set([...base.ownedItems, ...strings(r.ownedItems).filter(s => itemKeys.includes(s))])],
    completedActivities: strings(r.completedActivities).filter(k => activityKeys.includes(k)),
    creditedQuestions: strings(r.creditedQuestions).filter(k => /^u[123]-[a-z0-9-]+$/.test(k)).slice(0, 2000),
    mastery: Object.fromEntries(Object.entries(record(r.mastery)).filter(([k]) => wordKeys.has(k)).map(([k, v]) => [k, integer(v, 3)])),
    bestScores: Object.fromEntries(Object.entries(record(r.bestScores)).filter(([k]) => ['1', '2', '3'].includes(k)).map(([k, v]) => [k, integer(v, 100)])),
    rewardedUnits: [...new Set(array(r.rewardedUnits).filter((n): n is number => n === 1 || n === 2 || n === 3))],
    chestRewards: Object.fromEntries(Object.entries(record(r.chestRewards)).filter((entry): entry is [string, string] => ['1', '2', '3'].includes(entry[0]) && typeof entry[1] === 'string' && itemKeys.includes(entry[1]))),
    reviews: parseReviews(r.reviews, r.language === 'en' ? 'en' : 'id'),
    reviewSession: parseReviewSession(r.reviewSession, r.language === 'en' ? 'en' : 'id'),
  };
  if (!p.ownedAnimals.includes(p.mascot.animal)) p.mascot = validateMascotConfig({});
  if (!p.ownedSkins.includes(p.mascot.skin)) p.mascot.skin = 'none';
  if (!p.ownedItems.includes(`hand:${p.mascot.hand}`)) p.mascot.hand = 'qalam';
  for (const slot of ['head', 'neck'] as const) if (!p.ownedItems.includes(`${slot}:${p.mascot[slot]}`)) p.mascot[slot] = 'none';
  p.session = parseSession(r.session, p);
  p.savedSessions = Object.fromEntries(Object.entries(record(r.savedSessions)).flatMap(([key, value]) => {
    if (!activityKeys.includes(key)) return [];
    const saved = parseSession(value, p);
    return saved && activityKey(saved.unitId, saved.activityId) === key ? [[key, saved]] : [];
  }));
  if (p.session) {
    delete p.savedSessions[activityKey(p.session.unitId, p.session.activityId)];
    // Old v1 backups have no review queue; recover mistakes still present in their active lesson.
    if (r.reviews === undefined) for (const a of p.session.answers) {
      const q = questionSource(a.questionId, p.language)?.question;
      if (q && q.kind !== 'study' && (!a.correct || a.skipped)) p.reviews[a.questionId] = { reason: a.skipped && q.kind === 'speak' ? 'speech-skipped' : 'incorrect', failures: 1, lastAttemptDay: localDay(now) };
    }
  }
  return p;
}

export function streak(profile: Profile, now = new Date()): number {
  const today = dayNumber(localDay(now));
  const days = new Set(profile.activityDays.map(dayNumber));
  let cursor = days.has(today) ? today : today - 1, count = 0;
  while (days.has(cursor)) { count++; cursor--; }
  return count;
}

export const isUnitUnlocked = (p: Profile, unitId: number) => unitId === 1 || (unitId <= UNITS.length && p.rewardedUnits.includes(unitId - 1));
export const masteryPct = (p: Profile, unit: Unit) => Math.round(unit.words.filter(w => (p.mastery[w.idKey] ?? 0) >= 3).length / unit.words.length * 100);

export function isActivityUnlocked(p: Profile, unit: Unit, id: string): boolean {
  if (!isUnitUnlocked(p, unit.id)) return false;
  const list = activities(unit), index = list.findIndex(a => a.id === id);
  if (index < 0) return false;
  if (p.completedActivities.includes(activityKey(unit.id, id))) return true;
  if (id === 'quiz') return list.slice(0, -1).every(a => p.completedActivities.includes(activityKey(unit.id, a.id))) && masteryPct(p, unit) >= 80;
  return index === 0 || p.completedActivities.includes(activityKey(unit.id, list[index - 1].id));
}

export function lessonCheckpoint(p: Profile, unitId: number, activityId: string): Session | null {
  return p.session?.unitId === unitId && p.session.activityId === activityId ? p.session : p.savedSessions?.[activityKey(unitId, activityId)] ?? null;
}

export function beginSession(p: Profile, unitId: number, activityId: string): Profile {
  const unit = unitsFor(p).find(u => u.id === unitId);
  if (!unit || !isActivityUnlocked(p, unit, activityId)) return p;
  if (p.session?.unitId === unitId && p.session.activityId === activityId) return p;
  const session = lessonCheckpoint(p, unitId, activityId) ?? { unitId, activityId, questionVersion: 2, cursor: 0, answers: [], hintAt: null };
  const savedSessions = { ...p.savedSessions };
  if (p.session) savedSessions[activityKey(p.session.unitId, p.session.activityId)] = p.session;
  delete savedSessions[activityKey(unitId, activityId)];
  return { ...p, savedSessions, session };
}

export function answerQuestion(p: Profile, q: Question, correct: boolean, skipped = false, now = new Date()): Profile {
  const s = p.session;
  if (!s || s.answers.length > s.cursor) return p;
  const unit = unitsFor(p).find(u => u.id === s.unitId)!;
  const activity = activities(unit).find(a => a.id === s.activityId)!;
  if (questions(unit, activity, p.language, s.questionVersion ?? 1)[s.cursor]?.id !== q.id) return p;
  const hinted = s.hintAt === s.cursor;
  const answer: Answer = { questionId: q.id, correct, skipped, hinted, ...(q.word ? { wordId: q.word.idKey } : {}) };
  return {
    ...recordLearningAnswer(p, q.id, correct, skipped, hinted, now),
    session: { ...s, answers: [...s.answers, answer] },
  };
}

export function advanceSession(p: Profile): Profile {
  const s = p.session;
  if (!s || s.answers.length <= s.cursor) return p;
  return { ...p, session: { ...s, cursor: s.cursor + 1, hintAt: null } };
}

export function sessionScore(session: Session): number {
  const graded = session.answers.filter(a => !a.questionId.includes('-study-'));
  return graded.length ? Math.round(graded.filter(a => a.correct && !a.skipped).length / graded.length * 100) : 0;
}

export type UnitReward = { firstPass: boolean; dates: number; score: number; stars: number; skin: string | null };
export function completeSession(p: Profile, now = new Date()): { profile: Profile; reward: UnitReward | null } {
  const s = p.session;
  if (!s) return { profile: p, reward: null };
  const unit = unitsFor(p).find(u => u.id === s.unitId)!;
  const activity = activities(unit).find(a => a.id === s.activityId)!;
  const bank = questions(unit, activity, p.language, s.questionVersion ?? 1);
  if (s.cursor < bank.length || s.answers.length < bank.length) return { profile: p, reward: null };
  const key = activityKey(unit.id, activity.id);
  if (activity.kind !== 'quiz') {
    // Skipping speech is allowed; failed vocabulary is reviewed again through the session.
    const completed = p.completedActivities.includes(key) ? p.completedActivities : [...p.completedActivities, key];
    return { profile: { ...p, completedActivities: completed, session: null }, reward: null };
  }
  const score = sessionScore(s);
  const next: Profile = { ...p, bestScores: { ...p.bestScores, [unit.id]: Math.max(score, p.bestScores[unit.id] ?? 0) }, session: null };
  if (score < 80) return { profile: next, reward: { firstPass: false, dates: 0, score, stars: 0, skin: null } };
  const firstPass = !p.rewardedUnits.includes(unit.id);
  const dates = firstPass ? 30 + (score >= 95 ? 20 : 0) : 0;
  const skin = firstPass && unit.id === 3 ? 'sailor' : null;
  return {
    profile: {
      ...next, dates: p.dates + dates,
      xp: p.xp + (firstPass ? 30 : 0),
      completedActivities: [...new Set([...p.completedActivities, key])],
      rewardedUnits: firstPass ? [...p.rewardedUnits, unit.id] : p.rewardedUnits,
      activityDays: [...new Set([...p.activityDays, localDay(now)])].sort(),
      ownedAnimals: unit.id >= 2 ? [...new Set([...p.ownedAnimals, 'camel'])] : p.ownedAnimals,
      ownedSkins: skin ? [...new Set([...p.ownedSkins, skin])] : p.ownedSkins,
    },
    reward: { firstPass, dates, score, stars: score >= 95 ? 3 : score >= 90 ? 2 : 1, skin },
  };
}

export function openChest(p: Profile, unitId: number): Profile {
  if (p.chestRewards[unitId] || !p.completedActivities.includes(activityKey(unitId, 'dialogue'))) return p;
  const reward = ['hand:lantern', 'head:peci', 'neck:scarf'][unitId - 1];
  if (!reward) return p;
  return { ...p, dates: p.dates + 10, ownedItems: [...new Set([...p.ownedItems, reward])], chestRewards: { ...p.chestRewards, [unitId]: reward } };
}

export const availableHints = (p: Profile, now = new Date()) => p.hintDay === localDay(now) ? Math.max(0, 3 + p.hintsPurchased - p.hintsUsed) : 3;
export function useHint(p: Profile, now = new Date()): Profile {
  const s = p.session;
  if (!s || s.activityId === 'quiz' || s.answers.length > s.cursor || s.hintAt === s.cursor || availableHints(p, now) <= 0) return p;
  const sameDay = p.hintDay === localDay(now);
  return { ...p, hintDay: localDay(now), hintsUsed: (sameDay ? p.hintsUsed : 0) + 1, hintsPurchased: sameDay ? p.hintsPurchased : 0, session: { ...s, hintAt: s.cursor } };
}
export function buyHint(p: Profile, now = new Date()): Profile {
  const sameDay = p.hintDay === localDay(now), purchased = sameDay ? p.hintsPurchased : 0;
  if (p.dates < 10 || purchased >= 5) return p;
  return { ...p, dates: p.dates - 10, hintDay: localDay(now), hintsUsed: sameDay ? p.hintsUsed : 0, hintsPurchased: purchased + 1 };
}

export const CATALOG_PRICES: Record<string, number> = { 'animal:cat': 200, 'skin:sailor': 100, 'skin:vest': 100, 'skin:batik': 150, 'skin:koko': 400, 'item:hand:lantern': 30, 'item:hand:dates': 20, 'item:hand:dhow': 60, 'item:hand:telescope': 40, 'item:hand:scroll': 40, 'item:head:kumma': 50, 'item:head:mussar': 80, 'item:head:peci': 30, 'item:neck:scarf': 40 };
export function purchase(p: Profile, category: 'animal' | 'skin' | 'item', key: string): Profile {
  // Prices and eligibility are domain rules, never taken from a UI request.
  const listKey = category === 'animal' ? 'ownedAnimals' : category === 'skin' ? 'ownedSkins' : 'ownedItems';
  const price = CATALOG_PRICES[`${category}:${key}`];
  if (price === undefined || p[listKey].includes(key) || p.dates < price) return p;
  return { ...p, dates: p.dates - price, [listKey]: [...p[listKey], key] };
}

export function equipMascot(p: Profile, raw: unknown, now = new Date()): Profile {
  const mascot = validateMascotConfig(raw);
  const ownedAnimals = [...new Set([...p.ownedAnimals, ...(p.rewardedUnits.includes(2) ? ['camel'] : []), ...(streak(p, now) >= 7 ? ['turtle'] : [])])];
  if (!ownedAnimals.includes(mascot.animal) || !p.ownedSkins.includes(mascot.skin)) return p;
  if (['hand', 'head', 'neck'].some(slot => !p.ownedItems.includes(`${slot}:${mascot[slot as 'hand' | 'head' | 'neck']}`))) return p;
  return { ...p, ownedAnimals, mascot };
}
