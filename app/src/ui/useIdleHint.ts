import { useEffect, useState } from 'react';

export function useIdleHint(questionId: string): boolean {
  const [offered, setOffered] = useState(false);
  useEffect(() => {
    let revealed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setOffered(false);
    const reset = () => {
      if (revealed) return;
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(() => { revealed = true; setOffered(true); }, 20000);
    };
    const visibility = () => { clearTimeout(timer); if (!document.hidden) reset(); };
    reset();
    document.addEventListener('pointerdown', reset, { passive: true });
    document.addEventListener('keydown', reset); document.addEventListener('input', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', reset); document.removeEventListener('keydown', reset); document.removeEventListener('input', reset); document.removeEventListener('visibilitychange', visibility); };
  }, [questionId]);
  return offered;
}
