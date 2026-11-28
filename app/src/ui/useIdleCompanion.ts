import { useEffect } from 'react';
import { emitCompanion } from './Companion';

export const CONFUSED_AFTER_MS = 15000, SLEEP_AFTER_MS = 45000;

/** Bila `active` (soal terbuka, belum dijawab) dan pengguna diam: companion berpikir (15 dtk) lalu tidur (45 dtk). Interaksi mereset
 *  dan membangunkan. Semua timer dibersihkan saat soal berganti, soal dijawab, atau layar ditinggalkan. */
export function useIdleCompanion(active: boolean, questionId: string) {
  useEffect(() => {
    if (!active) return;
    let confused: ReturnType<typeof setTimeout> | undefined, sleep: ReturnType<typeof setTimeout> | undefined, signalled = false;
    const clear = () => { clearTimeout(confused); clearTimeout(sleep); };
    const arm = () => {
      clear();
      if (document.hidden) return;
      confused = setTimeout(() => { signalled = true; emitCompanion('confused'); }, CONFUSED_AFTER_MS);
      sleep = setTimeout(() => { signalled = true; emitCompanion('sleep'); }, SLEEP_AFTER_MS);
    };
    const interact = () => { if (signalled) { signalled = false; emitCompanion('wake'); } arm(); };
    const visibility = () => { if (document.hidden) clear(); else interact(); };
    arm();
    document.addEventListener('pointerdown', interact, { passive: true });
    document.addEventListener('keydown', interact); document.addEventListener('input', interact);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clear();
      document.removeEventListener('pointerdown', interact); document.removeEventListener('keydown', interact); document.removeEventListener('input', interact);
      document.removeEventListener('visibilitychange', visibility);
      if (signalled) emitCompanion('wake');
    };
  }, [active, questionId]);
}
