import type { Session } from './types';

export function hasRepeatedMistakes(session: Session | null): boolean {
  if (!session || session.activityId === 'quiz') return false;
  const graded = session.answers.filter(a => !a.skipped && !a.questionId.includes('-study-')).slice(-2);
  return graded.length === 2 && graded.every(a => !a.correct);
}
