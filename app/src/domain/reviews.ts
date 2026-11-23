import { activities, questions, UNITS } from './content';
import { localDay, validDay } from './calendar';
import type { ActivityKind, Answer, Language, Profile, Question, ReviewEntry, ReviewSession } from './types';

type QuestionSource = { unitId: number; activityId: string; activityKind: ActivityKind; question: Question };
const directories = new Map<Language, Map<string, QuestionSource>>();
export function questionSource(id: string, language: Language): QuestionSource | undefined {
  let directory = directories.get(language);
  if (!directory) {
    // Retain legacy quiz sources so saved mistakes and in-progress v1 exams remain usable.
    directory = new Map(UNITS.flatMap(unit => activities(unit).flatMap(activity => {
      const bank = activity.kind === 'quiz' ? [...questions(unit, activity, language, 1), ...questions(unit, activity, language, 2)] : questions(unit, activity, language);
      return bank.map(question => [question.id, { unitId: unit.id, activityId: activity.id, activityKind: activity.kind, question }] as const);
    })));
    directories.set(language, directory);
  }
  return directory.get(id);
}

/** Shared credit rules for lessons and targeted review. An original exam answer never grants review XP or changes its exam score. */
export function recordLearningAnswer(p: Profile, id: string, correct: boolean, skipped: boolean, hinted: boolean, now = new Date()): Profile {
  const source = questionSource(id, p.language);
  if (!source || source.question.kind === 'study') return p;
  const { question: q, activityKind } = source;
  const success = correct && !skipped;
  const firstCredit = success && activityKind !== 'quiz' && !p.creditedQuestions.includes(id);
  const reviews = { ...p.reviews };
  if (success) delete reviews[id];
  else reviews[id] = { reason: skipped && q.kind === 'speak' ? 'speech-skipped' : 'incorrect', failures: Math.min(10000, (reviews[id]?.failures ?? 0) + 1), lastAttemptDay: localDay(now) };
  return {
    ...p, reviews,
    xp: p.xp + (firstCredit ? (hinted ? 2 : 5) : 0),
    creditedQuestions: firstCredit ? [...p.creditedQuestions, id] : p.creditedQuestions,
    mastery: firstCredit && q.word ? { ...p.mastery, [q.word.idKey]: Math.min(3, (p.mastery[q.word.idKey] ?? 0) + 1) } : p.mastery,
    activityDays: success && !p.activityDays.includes(localDay(now)) ? [...p.activityDays, localDay(now)].sort() : p.activityDays,
  };
}

export function pendingReviews(p: Profile, unitId?: number): QuestionSource[] {
  return Object.entries(p.reviews).sort((a, b) => a[1].lastAttemptDay.localeCompare(b[1].lastAttemptDay) || b[1].failures - a[1].failures || a[0].localeCompare(b[0])).flatMap(([id]) => {
    const source = questionSource(id, p.language);
    return source && (!unitId || source.unitId === unitId) ? [source] : [];
  });
}
export function beginReview(p: Profile): Profile {
  if (p.reviewSession) return p;
  const questionIds = pendingReviews(p).map(s => s.question.id);
  return questionIds.length ? { ...p, reviewSession: { questionIds, cursor: 0, answers: [] } } : p;
}
export function answerReview(p: Profile, id: string, correct: boolean, skipped = false, now = new Date()): Profile {
  const s = p.reviewSession;
  if (!s || s.questionIds[s.cursor] !== id || s.answers.length > s.cursor) return p;
  const q = questionSource(id, p.language)?.question;
  if (!q) return p;
  const answer: Answer = { questionId: id, correct, skipped, hinted: false, ...(q.word ? { wordId: q.word.idKey } : {}) };
  return { ...recordLearningAnswer(p, id, correct, skipped, false, now), reviewSession: { ...s, answers: [...s.answers, answer] } };
}
export function advanceReview(p: Profile): Profile {
  const s = p.reviewSession;
  return !s || s.answers.length <= s.cursor ? p : { ...p, reviewSession: { ...s, cursor: s.cursor + 1 } };
}
export function completeReview(p: Profile): Profile {
  return p.reviewSession && p.reviewSession.cursor >= p.reviewSession.questionIds.length ? { ...p, reviewSession: null } : p;
}

const object = (raw: unknown): Record<string, unknown> => raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
const integer = (raw: unknown, max: number) => typeof raw === 'number' && Number.isFinite(raw) ? Math.min(max, Math.max(0, Math.floor(raw))) : 0;
export function parseReviews(raw: unknown, language: Language): Record<string, ReviewEntry> {
  return Object.fromEntries(Object.entries(object(raw)).flatMap(([id, value]) => {
    const source = questionSource(id, language), entry = object(value);
    if (!source || source.question.kind === 'study' || !validDay(entry.lastAttemptDay)) return [];
    if (entry.reason !== 'incorrect' && !(entry.reason === 'speech-skipped' && source.question.kind === 'speak')) return [];
    return [[id, { reason: entry.reason, failures: Math.max(1, integer(entry.failures, 10000)), lastAttemptDay: entry.lastAttemptDay }]];
  }));
}
export function parseReviewSession(raw: unknown, language: Language): ReviewSession | null {
  const s = object(raw);
  if (!Array.isArray(s.questionIds) || !s.questionIds.length || s.questionIds.length > 1000) return null;
  const ids: string[] = [];
  for (const id of s.questionIds) {
    if (typeof id !== 'string' || ids.includes(id)) return null;
    const source = questionSource(id, language);
    if (!source || source.question.kind === 'study') return null;
    ids.push(id);
  }
  const answers: Answer[] = [];
  for (const [index, value] of (Array.isArray(s.answers) ? s.answers : []).entries()) {
    const a = object(value), source = questionSource(ids[index], language);
    if (!source || a.questionId !== ids[index] || typeof a.correct !== 'boolean' || typeof a.skipped !== 'boolean') break;
    answers.push({ questionId: ids[index], correct: a.correct, skipped: a.skipped, hinted: false, ...(source.question.word ? { wordId: source.question.word.idKey } : {}) });
  }
  const cursor = Math.min(integer(s.cursor, ids.length), answers.length);
  return { questionIds: ids, cursor, answers: answers.slice(0, cursor + 1) };
}
