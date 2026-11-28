import texts from '../domain/companionTexts.json';
import type { Localized } from '../domain/types';
import { ICONS, ITEM_KEYS, itemText } from './ItemInfo';
import type { ItemKey } from './ItemInfo';

/**
 * Isi balon companion, bergilir antar empat jenis: penjelasan item, tips memakai app, motivasi belajar, mahfuzhat.
 * Semua teks Arab dari Shaharil (ui-strings.json lewat itemInfo.json dan companionTexts.json); tidak ada Arab buatan sendiri.
 * Ketukan ke-n memakai jenis (n mod 4) dan urutan ke-(n div 4) di dalam jenis itu.
 */
export type BubbleKind = 'item' | 'tip' | 'motivasi' | 'mahfuzhat';
export const BUBBLE_KINDS: BubbleKind[] = ['item', 'tip', 'motivasi', 'mahfuzhat'];
export type BubbleContent = { kind: BubbleKind; id: string; text: Localized; icon: string; item?: ItemKey; part?: 'use' | 'get' };
const KIND_ICONS = { tip: 'compass', motivasi: 'heart', mahfuzhat: 'book' } as const;
const lists = texts as Record<'tip' | 'motivasi' | 'mahfuzhat', Localized[]>;
export const BUBBLE_COUNTS = { item: ITEM_KEYS.length * 2, tip: lists.tip.length, motivasi: lists.motivasi.length, mahfuzhat: lists.mahfuzhat.length };

export function bubbleAt(turn: number): BubbleContent {
  const kind = BUBBLE_KINDS[turn % BUBBLE_KINDS.length], n = Math.floor(turn / BUBBLE_KINDS.length);
  if (kind === 'item') {
    const i = n % BUBBLE_COUNTS.item, item = ITEM_KEYS[i >> 1], part = i % 2 ? 'get' : 'use';
    return { kind, id: `${item}.${part}`, text: itemText(item)[part], icon: ICONS[item], item, part };
  }
  const index = n % BUBBLE_COUNTS[kind];
  return { kind, id: `${kind}.${index + 1}`, text: lists[kind][index], icon: KIND_ICONS[kind] };
}
