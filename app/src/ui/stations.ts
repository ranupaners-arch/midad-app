import routes from '../../../design-system/assets/rihlah/routes.json';
import { activities, activityKey, unitsFor } from '../domain/content';
import { isUnitUnlocked } from '../domain/progress';
import { useProfile } from '../store';
import type { Unit } from '../domain/types';

export type StationState = 'done' | 'current' | 'locked';
export type Station = {
  index: number; unit: Unit; ordinal: string; port: string; state: StationState; unlocked: boolean; count: number; total: number; action: string;
  /** nama aksesibel (Arab dari data) untuk titik di peta */
  label: string;
};

// Teks Arab yang SUDAH ADA di aplikasi (Journey.tsx, Unit.tsx) dan design system (LessonNode); tidak ada teks Arab baru.
const ORDINALS = ['الْأُولَى', 'الثَّانِيَةُ', 'الثَّالِثَةُ'];
export const LOCKED_HINT = 'أَكْمِلِ الْوَحْدَةَ السَّابِقَةَ';
const LOCKED_WORD = 'مُقْفَلٌ';
const DONE_WORD = 'تَمَّ';

export function useStations(): Station[] {
  const { profile } = useProfile();
  return unitsFor(profile).map((unit, index) => {
    const unlocked = isUnitUnlocked(profile, unit.id), done = profile.rewardedUnits.includes(unit.id);
    const list = activities(unit);
    const count = list.filter(a => profile.completedActivities.includes(activityKey(unit.id, a.id))).length;
    const state: StationState = done ? 'done' : unlocked ? 'current' : 'locked';
    const ordinal = ORDINALS[index] ?? String(index + 1), port = routes.routes.id[0].ports[index] ?? '';
    const base = `الْوَحْدَةُ ${ordinal}: ${unit.title.ar} · ${port}`;
    return {
      index, unit, ordinal, port, state, unlocked, count, total: list.length,
      action: done ? 'مُرَاجَعَةٌ' : count ? 'مُتَابَعَة' : 'اِبْدَأْ',
      label: state === 'locked' ? `${base} · ${LOCKED_WORD}` : state === 'done' ? `${base} · ${DONE_WORD}` : base,
    };
  });
}

/** Stasiun yang dipilih awalnya: wahdah yang sedang dikerjakan; bila semua selesai, yang terakhir. */
export function defaultStation(stations: Station[]): number {
  const current = stations.findIndex(s => s.state === 'current');
  return current >= 0 ? current : Math.max(0, stations.length - 1);
}
