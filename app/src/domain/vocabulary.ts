import type { Unit, Vocabulary } from './types';
import { normalizeArabic } from './speech';

export type MasteryFilter = 'all' | 'new' | 'learning' | 'mastered';
export const masteryFilter = (value: string | null): MasteryFilter => value === 'new' || value === 'learning' || value === 'mastered' ? value : 'all';
export function normalizeVocabularyQuery(text: string): string {
  const digits = text.replace(/[٠-٩]/g, ch => String(ch.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, ch => String(ch.charCodeAt(0) - 0x6f0));
  return normalizeArabic(digits.toLowerCase().replace(/[-–—/()]/g, ' '));
}
export function filterVocabulary(unit: Unit, mastery: Record<string, number>, query: string, status: MasteryFilter): Vocabulary[] {
  const needle = normalizeVocabularyQuery(query);
  return unit.words.filter(word => {
    const count = mastery[word.idKey] ?? 0;
    if (status === 'new' && count > 0 || status === 'learning' && (count === 0 || count >= 3) || status === 'mastered' && count < 3) return false;
    return !needle || [word.ar, word.id, word.en, /^\d+$/.test(word.symbol) ? word.symbol : ''].some(text => normalizeVocabularyQuery(text).includes(needle));
  });
}
export function vocabularySessionId(unit: Unit, id: string): string | null {
  const index = unit.words.findIndex(word => word.idKey === id);
  return index < 0 ? null : `vocab-${Math.floor(index / Math.ceil(unit.words.length / 3)) + 1}`;
}
