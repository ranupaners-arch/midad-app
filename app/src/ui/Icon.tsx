import { useState } from 'react';
import type { CSSProperties } from 'react';
import { iconImageUrl } from './iconAssets';
import '../icons.css';

const paths: Record<string, string> = {
  route: 'M5 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 14a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM7 7v5a3 3 0 0 0 3 3h4a3 3 0 0 1 3 3M17 6V3m0 0 4 2-4 2',
  book: 'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15',
  wardrobe: 'M9 5a3 3 0 0 1 6 0c0 2-3 2-3 4l9 6a2 2 0 0 1-1 4H4a2 2 0 0 1-1-4l9-6',
  person: 'M8 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM4 22v-2a8 8 0 0 1 16 0v2',
  lantern: 'M9 4h6m-3-2v2M8 8h8l2 12H6L8 8Zm1-4L7 8m8-4 2 4m-5 3v5',
  dates: 'M12 5c-5 0-8 4-8 9s4 8 8 7c4 1 8-2 8-7s-3-9-8-9Zm0 0c0-3 2-4 4-4m-4 7-2 9',
  star: 'm12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Z',
  check: 'm5 12 4 4L19 6', cross: 'm6 6 12 12M6 18 18 6', lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3',
  sound: 'M3 9h4l5-5v16l-5-5H3V9Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16',
  mute: 'M3 9h4l5-5v16l-5-5H3V9Zm13 0 6 6m-6 0 6-6',
  mic: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Zm-4 6a7 7 0 0 0 14 0m-7 7v4m-4 0h8',
  sun: 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
  moon: 'M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z',
  translate: 'M2 4h12M8 2v2m-4 3c1 5 5 8 10 9M12 4c0 6-4 10-10 12m11 5 5-12 5 12m-8-4h6',
  compass: 'M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Zm6 4 2-6 6-2-2 6-6 2Z',
  trophy: 'M7 3h10v8a5 5 0 0 1-10 0V3Zm0 2H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5m-4 3v5m-5 1h10',
  chest: 'M3 11V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3M3 11h18v10H3V11Zm7-2h4v6h-4V9ZM6 4v7m12-7v7',
  drop: 'M12 2C9 7 4 11 4 16a8 8 0 0 0 16 0c0-5-5-9-8-14Zm-4 14a4 4 0 0 0 4 4',
  pen: 'm4 16 12-12 4 4L8 20l-6 2 2-6Zm10-10 4 4M4 16l4 4',
  globe: 'M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Zm0 0h20M12 2c-6 5-6 15 0 20 6-5 6-15 0-20Z',
  heart: 'M12 21 3 12C-3 5 7-2 12 5 17-2 27 5 21 12l-9 9Z',
  greeting: 'M4 12a8 8 0 1 1 3 6l-5 3 2-6m4-5h8m-8 4h5',
  question: 'M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Zm7-4a3 3 0 0 1 6 1c0 2-3 2-3 4m0 4v.1',
  phone: 'M7 2h10v20H7V2Zm0 4h10M7 18h10m-6 2h2',
  plus: 'M12 4v16M4 12h16', back: 'm9 5 7 7-7 7', repeat: 'M4 7h12a5 5 0 0 1 0 10H4m4-14L4 7l4 4m0 2-4 4 4 4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 2 3 4-1 2 4-2 3 2 3-2 4-4-1-2 3-3-3-4 1-2-4 2-3-2-3 2-4 4 1 3-3Z',
};
/** Kurma dan lentera memakai gambar WebP (Gemini); bila gagal dimuat jatuh ke ikon garis SVG di bawah. */
export function Icon({ name, className = '', style }: { name: string; className?: string; style?: CSSProperties }) {
  const [failed, setFailed] = useState(false), image = failed ? undefined : iconImageUrl(name);
  if (image) return <img className={`icon icon-img ${className}`} style={style} src={image} alt="" width={24} height={24} aria-hidden="true" onError={() => setFailed(true)} />;
  return <svg className={`icon ${className}`} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.book} /></svg>;
}
export function Logo() { return <span className="logo"><svg viewBox="0 0 40 44" aria-hidden="true"><path d="M20 1C15 11 4 21 4 29a16 16 0 0 0 32 0C36 21 25 11 20 1Z" fill="currentColor"/><path d="m14 29 12-12 4 4-12 12-7 3Z" fill="var(--gold)"/></svg><span>مِدَاد<span className="logo-latin" lang="en" dir="ltr">MIDAD</span></span></span>; }
