import { useEffect, useId, useMemo, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { MascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { renderMascot } from '../../../design-system/assets/maskot/mascot.mjs';
import { isVehicleId, rideVehicle } from '../../../design-system/assets/maskot/vehicles.mjs';
import { useProfile } from '../store';
import type { Localized } from '../domain/types';
import { Icon } from './Icon';
import '../ux-kontras.css';

export function Tr({ text, force = false, small = false }: { text: Localized; force?: boolean; small?: boolean }) {
  const { profile } = useProfile();
  if (!force && !profile.translation) return null;
  return <span className={`translation ${small ? 'small' : ''}`} lang={profile.language} dir="ltr">{text[profile.language]}</span>;
}
export function Text({ text, force = false }: { text: Localized; force?: boolean }) { return <><span lang="ar">{text.ar}</span><Tr text={text} force={force} /></>; }
export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'success' }) {
  return <button type="button" className={`md-btn ${variant === 'primary' ? '' : `md-btn--${variant}`} ${className}`} {...props}>{children}</button>;
}
export function Mascot({ config, emote, className = '', decorative = false }: { config?: Partial<MascotConfig>; emote?: MascotConfig['emote']; className?: string; decorative?: boolean }) {
  const { profile } = useProfile();
  const svg = useMemo(() => renderMascot({ ...profile.mascot, ...config, ...(emote ? { emote } : {}) }, { label: 'رَفِيقُكَ فِي الرِّحْلَةِ' }), [profile.mascot, config, emote]);
  return <div className={`mascot ${className}`} aria-hidden={decorative || undefined} dangerouslySetInnerHTML={{ __html: svg }} />;
}
export function Vehicle({ id = 'pinisi', className = '' }: { id?: string; className?: string }) {
  const { profile } = useProfile();
  const svg = useMemo(() => rideVehicle(isVehicleId(id) ? id : 'pinisi', profile.mascot), [id, profile.mascot]);
  return <div className={`vehicle ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
export function WordPicture({ symbol }: { symbol: string }) {
  return <div className="word-picture" aria-hidden="true">{/^\d+$/.test(symbol) ? <span className="picture-number">{symbol}</span> : <Icon name={symbol} />}</div>;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return <progress className="progress" value={Math.min(100, Math.max(0, value))} max="100" aria-label={label} />;
}
export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), id = useId();
  useEffect(() => { const dialog = ref.current!; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
  return <dialog className="dialog" ref={ref} aria-labelledby={id} onClose={() => { if (ref.current) ref.current.returnValue = ''; onClose(); }}>
    <div className="dialog-header"><h2 id={id}>{title}</h2><button type="button" className="icon-button" aria-label="إِغْلَاقٌ" onClick={() => ref.current?.close()} autoFocus><Icon name="cross" /></button></div>
    {children}
  </dialog>;
}
