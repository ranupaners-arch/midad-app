import { activities, questions, UNITS } from './content';
import { isActivityUnlocked } from './progress';
import type { Profile } from './types';

export function savedLessons(profile: Profile) {
  const sessions = [...(profile.session ? [profile.session] : []), ...Object.values(profile.savedSessions ?? {}).reverse()];
  return sessions.flatMap(session => {
    const unit = UNITS.find(u => u.id === session.unitId), activity = unit && activities(unit).find(a => a.id === session.activityId);
    if (!unit || !activity || !isActivityUnlocked(profile, unit, activity.id)) return [];
    const total = questions(unit, activity, profile.language, session.questionVersion ?? 1).length;
    return [{ unit, activity, session, total, position: Math.min(session.cursor + 1, total) }];
  });
}

export const demoCompleted = (profile: Profile) => UNITS.every(unit => profile.rewardedUnits.includes(unit.id));
