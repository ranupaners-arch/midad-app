import { useId, useMemo } from 'react';
import routes from '../../../design-system/assets/rihlah/routes.json';
import { isVehicleId, rideVehicle } from '../../../design-system/assets/maskot/vehicles.mjs';
import strings from '../domain/levelup-strings.json';
import { useProfile } from '../store';
import '../levelup.css';

// Jalur dan node mengikuti design system (components/LevelUpTravel): pelabuhan lama emas, kendaraan meluncur, pelabuhan baru menyala.
const FROM = { x: 330, y: 470 }, TO = { x: 320, y: 140 }, NEXT = { x: 220, y: 70 };
const LEG = 'M330 470 C 330 400 120 380 130 300 C 140 220 330 220 320 140';
const FULL = `${LEG} C 314 100 260 80 220 70`;
export const TRAVEL_SECONDS = 3.4;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animasi naik level: maskot (lengkap dengan skin/itemnya) berlayar dari pelabuhan yang baru selesai ke pelabuhan berikutnya.
 * `level` = nomor wahdah tujuan. Reduced motion: kendaraan langsung tampil di pelabuhan baru.
 */
export default function LevelUpTravel({ level, vehicle = 'pinisi' }: { level: number; vehicle?: string }) {
  const { profile } = useProfile();
  const pathId = `lv-leg-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const reduce = useMemo(prefersReducedMotion, []);
  const ports = routes.routes.id[0].ports;
  const port = ports[Math.min(level - 1, ports.length - 1)] ?? '';
  const banner = { ar: strings.banner.ar.replace('{port}', port), id: strings.banner.id.replace('{port}', port), en: strings.banner.en.replace('{port}', port) }, lang = profile.language;
  const ride = useMemo(() => rideVehicle(isVehicleId(vehicle) ? vehicle : 'pinisi', profile.mascot, { attrs: 'x="-80" y="-78" width="160" height="100"' }), [vehicle, profile.mascot]);
  return <div className={`md-lvl lv ${reduce ? 'lv-static' : ''}`} role="status" aria-live="polite" data-testid="level-up" data-level={level}>
    <svg className="md-lvl__map" viewBox="0 0 440 520" aria-hidden="true">
      <rect className="lv-sea" width="440" height="520" />
      <g className="lv-waves" fill="none" strokeWidth="4" strokeLinecap="round"><path d="M20 120 q20 -10 40 0 t40 0" /><path d="M300 300 q20 -10 40 0 t40 0" /><path d="M40 420 q20 -10 40 0 t40 0" /></g>
      <path className="lv-route" d={FULL} fill="none" strokeWidth="5" strokeDasharray="2 14" strokeLinecap="round" />
      <path id={pathId} d={LEG} fill="none" />
      <g transform={`translate(${FROM.x} ${FROM.y})`} className="lv-from"><circle r="26" /><path d="M -8 -1 l 6 7 l 11 -13" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></g>
      {/* Animasi CSS ada di <g> dalam: transform CSS pada <g> luar akan menimpa atribut translate(). */}
      <g transform={`translate(${TO.x} ${TO.y})`}><g className="lv-to"><circle className="lv-halo" r="38" fill="none" strokeWidth="4" /><circle className="lv-dot" r="30" /><text y="9" textAnchor="middle" className="number">{level}</text></g></g>
      <g transform={`translate(${NEXT.x} ${NEXT.y})`}><circle className="lv-next" r="18" /></g>
      <g className="lv-rider" transform={reduce ? `translate(${TO.x} ${TO.y})` : undefined}>
        {!reduce && <animateMotion dur={`${TRAVEL_SECONDS}s`} fill="freeze" calcMode="linear" keyPoints="0;1" keyTimes="0;1"><mpath href={`#${pathId}`} /></animateMotion>}
        <g dangerouslySetInnerHTML={{ __html: ride }} />
      </g>
    </svg>
    <div className="md-lvl__banner lv-banner">
      <b lang="ar">{banner.ar}</b>
      <span className="translation" lang={lang} dir="ltr" style={{ textAlign: 'center' }}>{banner[lang]}</span>
    </div>
  </div>;
}
