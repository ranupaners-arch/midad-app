import { useEffect, useRef, useState } from 'react';
import type { MascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { Mascot, Text } from './Common';
import { Icon } from './Icon';
import { bubbleAt } from './bubbleContent';
import type { BubbleContent } from './bubbleContent';
import '../companion.css';

/**
 * Companion yang bereaksi. Reaksi dikirim lewat bus kecil (emitCompanion) supaya layar belajar tidak perlu tahu di mana companion
 * ditampilkan (sidebar desktop dan/atau kepala layar belajar HP). Gerak murni CSS (transform) dan hanya bila prefers-reduced-motion
 * tidak meminta pengurangan; selain itu hanya ekspresi yang berganti. Dekoratif: tanpa teks baru, tidak masuk pembaca layar.
 */
export type CompanionSignal = 'right' | 'wrong' | 'confused' | 'sleep' | 'wake';
type Motion = 'hop' | 'sway' | 'tilt' | 'breathe';
type Emote = NonNullable<MascotConfig['emote']>;
type Reaction = { emote: Emote; motion: Motion; hold: boolean };

const bus = new EventTarget();
export const emitCompanion = (signal: CompanionSignal) => bus.dispatchEvent(new CustomEvent('companion', { detail: signal }));

export const REACTIONS: Record<Exclude<CompanionSignal, 'wake'>, Reaction> = {
  right: { emote: 'cheer', motion: 'hop', hold: false },          // benar: ceria, melompat kecil
  wrong: { emote: 'surprised', motion: 'sway', hold: false },     // salah: kaget lembut, bergoyang pelan (tidak menghukum)
  confused: { emote: 'think', motion: 'tilt', hold: true },       // bingung: berpikir, kepala miring (bertahan sampai pengguna berinteraksi)
  sleep: { emote: 'sleep', motion: 'breathe', hold: true },       // lama diam: tidur (bertahan sampai pengguna berinteraksi)
};
const TAP_CYCLE: Reaction[] = [REACTIONS.right, REACTIONS.confused, REACTIONS.wrong].map(r => ({ ...r, hold: false }));
export const REACTION_MS = 1800;

export function useCompanionReaction(): { reaction: Reaction | null; tap: () => void } {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const turn = useRef(0);
  const show = (r: Reaction | null) => {
    clearTimeout(timer.current);
    setReaction(r);
    if (r && !r.hold) timer.current = setTimeout(() => setReaction(null), REACTION_MS);
  };
  useEffect(() => {
    const on = (event: Event) => {
      const signal = (event as CustomEvent<CompanionSignal>).detail;
      clearTimeout(timer.current);
      if (signal === 'wake') { setReaction(null); return; }
      const r = REACTIONS[signal];
      setReaction(r);
      if (!r.hold) timer.current = setTimeout(() => setReaction(null), REACTION_MS);
    };
    bus.addEventListener('companion', on);
    return () => { bus.removeEventListener('companion', on); clearTimeout(timer.current); };
  }, []);
  return { reaction, tap: () => { show(TAP_CYCLE[turn.current++ % TAP_CYCLE.length]); } };
}

export const BUBBLE_MS = 9000;

/** `decorative`: versi kecil di layar belajar; dapat diketuk tetapi tidak masuk urutan fokus maupun pembaca layar.
 *  `bubbles`: ketuk companion juga memunculkan balon bergilir: penjelasan item, tips memakai app, motivasi belajar, mahfuzhat (ui/bubbleContent.ts; teks Shaharil).
 *  Di layar soal/ujian bubbles dimatikan: ketuk hanya bereaksi agar tidak mengalihkan perhatian. */
export default function Companion({ className = '', decorative = false, bubbles = false, label = 'رَفِيقُكَ فِي الرِّحْلَةِ', onTap }: { className?: string; decorative?: boolean; bubbles?: boolean; label?: string; onTap?: () => void }) {
  const { reaction, tap } = useCompanionReaction();
  const [bubble, setBubble] = useState<BubbleContent | null>(null);
  const turn = useRef(0), hide = useRef<ReturnType<typeof setTimeout>>(undefined);
  const close = () => { clearTimeout(hide.current); setBubble(null); };
  useEffect(() => () => clearTimeout(hide.current), []);
  useEffect(() => {
    if (!bubble) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [bubble]);
  useEffect(() => { if (!bubbles) close(); }, [bubbles]);
  const explain = () => {
    setBubble(bubbleAt(turn.current++));
    clearTimeout(hide.current); hide.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  };
  return <>
    <button type="button" className={`companion ${className}`} data-testid="companion" data-emote={reaction?.emote ?? 'none'} data-motion={reaction?.motion ?? 'none'}
      {...(decorative ? { 'aria-hidden': true, tabIndex: -1 } : { 'aria-label': label })}
      onClick={() => { tap(); onTap?.(); if (bubbles) explain(); }}>
      <Mascot emote={reaction?.emote} decorative />
    </button>
    {bubbles && <div aria-live="polite" className="companion-status">{bubble && <button type="button" className={`companion-bubble kind-${bubble.kind}`} data-testid="companion-bubble" data-kind={bubble.kind} data-id={bubble.id} data-item={bubble.item} data-part={bubble.part} onClick={close}>
      <Icon name={bubble.icon} /><span><Text text={bubble.text} /></span>
    </button>}</div>}
  </>;
}
