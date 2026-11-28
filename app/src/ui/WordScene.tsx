import { useMemo } from 'react';
import { renderMascot } from '../../../design-system/assets/maskot/mascot.mjs';
import { useProfile } from '../store';
import { friendAnimal } from '../domain/scenes';
import type { SceneDef } from '../domain/scenes';
import { emojiUrl } from './sceneAssets';

type Slot = { size: number; left: number; floor: number; flip?: boolean };
// Posisi dalam persen lebar badge. "floor" = garis tanah maskot (480/512 tinggi SVG); atas kotak = floor - 0,9375 x size.
const SOLO: Slot = { size: 80, left: 10, floor: 84 };
const OVERRIDE: Record<string, Slot> = {
  'w1-v10': { size: 64, left: 18, floor: 90 }, // pintu kabin: maskot di ambang pintu
  'w2-v05': { size: 62, left: 0, floor: 92 }, // papan nama kosong tetap terlihat di kanan
  'w2-v14': { size: 58, left: 22, floor: 90 }, // tas dan buku di lantai
};
const DUO: [Slot, Slot] = [{ size: 62, left: -6, floor: 88 }, { size: 58, left: 50, floor: 88, flip: true }];
const CORNER: Slot = { size: 40, left: 6, floor: 92 };

function layout(def: SceneDef, key?: string): Slot[] {
  if (def.mode === 'none') return [];
  if (def.mode === 'duo') return DUO;
  if (def.mode === 'pojok') return [CORNER];
  return [(key && OVERRIDE[key]) || SOLO];
}

const box = (s: Slot) => ({ width: `${s.size}%`, left: `${s.left}%`, top: `${s.floor - 0.9375 * s.size}%` });

/**
 * Ilustrasi kosakata: latar adegan (Gemini, tanpa karakter) + maskot PILIHAN PENGGUNA digambar mascot.js di atasnya,
 * jadi hewan, warna, mata, item, dan skin ikut pilihan pengguna. Teman pendamping = kucing (atau Hudhud bila pengguna memilih kucing).
 * Semuanya dekoratif (aria-hidden): arti kata tetap dari teks Arab + terjemahan. Emoji hanya penanda makna untuk kata yang bergantung gerak.
 */
export default function WordScene({ def, url, sceneKey, onError }: { def: SceneDef; url: string; sceneKey?: string; onError: () => void }) {
  const { profile } = useProfile();
  const slots = layout(def, sceneKey);
  const user = useMemo(() => def.mode === 'none' ? '' : renderMascot({ ...profile.mascot, ...(def.emote ? { emote: def.emote } : {}) }, { label: '' }), [profile.mascot, def.mode, def.emote]);
  const friend = useMemo(() => def.mode === 'duo'
    ? renderMascot({ animal: friendAnimal(profile.mascot.animal), ...(def.friendFemale ? { mark: 'female' } : {}) }, { label: '' }) : '', [profile.mascot.animal, def.mode, def.friendFemale]);
  const emoji = def.emoji ? emojiUrl(def.emoji) : undefined;
  return <div className="word-scene" aria-hidden="true" data-scene={def.scene} data-mode={def.mode}>
    <img className="ws-bg" src={url} alt="" width={384} height={384} onError={onError} />
    {slots[0] && <div className="ws-ch" data-role="user" style={box(slots[0])} dangerouslySetInnerHTML={{ __html: user }} />}
    {slots[1] && <div className={`ws-ch ${slots[1].flip ? 'ws-flip' : ''}`} data-role="friend" data-female={def.friendFemale ? 'true' : undefined} style={box(slots[1])} dangerouslySetInnerHTML={{ __html: friend }} />}
    {emoji && <span className="ws-emoji" data-emoji={def.emoji}><img src={emoji} alt="" width={28} height={28} /></span>}
  </div>;
}
