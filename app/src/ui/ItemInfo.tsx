import { useEffect, useState } from 'react';
import info from '../domain/itemInfo.json';
import { availableHints, streak } from '../domain/progress';
import { unitsFor } from '../domain/content';
import { useProfile } from '../store';
import type { Localized } from '../domain/types';
import { Dialog, Text, Tr } from './Common';
import { Icon } from './Icon';
import '../itemInfo.css';

/**
 * Lembar penjelasan item (bintang/XP, kurma, lentera = hari beruntun, tetes bantuan, tetes pengetahuan): kegunaan + cara mendapat.
 * Semua teks Arab dari Shaharil (itemInfo.json disalin skrip sync-item-info.mjs dari ui-strings.json); faktanya diperiksa terhadap kode.
 * Dibuka dari mana saja lewat openItemInfo(); satu ItemInfoHost di App.
 */
export type ItemKey = 'xp' | 'dates' | 'streak' | 'hint' | 'mastery';
export const ITEM_KEYS: ItemKey[] = ['xp', 'dates', 'streak', 'hint', 'mastery'];
export const itemText = (item: ItemKey): { name: Localized; use: Localized; get: Localized } => info[item];
export const ICONS: Record<ItemKey, string> = { xp: 'star', dates: 'dates', streak: 'lantern', hint: 'drop', mastery: 'book' };

const bus = new EventTarget();
export const openItemInfo = (item: ItemKey) => bus.dispatchEvent(new CustomEvent('item-info', { detail: item }));

export function ItemInfoHost() {
  const { profile } = useProfile();
  const [item, setItem] = useState<ItemKey | null>(null);
  useEffect(() => {
    const on = (event: Event) => setItem((event as CustomEvent<ItemKey>).detail);
    bus.addEventListener('item-info', on);
    return () => bus.removeEventListener('item-info', on);
  }, []);
  if (!item) return null;
  const text = itemText(item);
  const mastered = Object.values(profile.mastery).filter(n => n >= 3).length, total = unitsFor(profile).reduce((n, u) => n + u.words.length, 0);
  const value = { xp: `${profile.xp}`, dates: `${profile.dates}`, streak: `${streak(profile)}`, hint: `${availableHints(profile)}`, mastery: `${mastered} / ${total}` }[item];
  return <Dialog open title={text.name.ar} onClose={() => setItem(null)}>
    <div className="item-info" data-testid="item-info" data-item={item}>
      <p className="item-info-value"><Icon name={ICONS[item]} /><b className="number" data-testid="item-info-value">{value}</b></p>
      <p className="item-info-translation"><Tr text={text.name} /></p>
      <p className="item-info-use" data-testid="item-info-use"><Text text={text.use} /></p>
      <p className="item-info-get" data-testid="item-info-get"><Text text={text.get} /></p>
    </div>
  </Dialog>;
}

/** Tombol kecil "i" di dekat penghitung; nama aksesibel = nama item (Arab dari Shaharil). */
export function InfoButton({ item, className = '' }: { item: ItemKey; className?: string }) {
  return <button type="button" className={`info-button ${className}`} data-testid={`info-${item}`} aria-label={itemText(item).name.ar} onClick={() => openItemInfo(item)}><Icon name="question" /></button>;
}
