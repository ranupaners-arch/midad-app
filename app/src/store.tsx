import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Profile } from './domain/types';
import { createProfile, parseProfile, STORAGE_KEY } from './domain/progress';

type Store = { profile: Profile; update: (fn: (p: Profile) => Profile) => void; storageError: boolean; reset: () => void; restore: (profile: Profile) => void };
const Context = createContext<Store | null>(null);
const newProfile = (): Profile => ({ ...createProfile(), curriculum: 'shaharil' });
function load() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return { profile: raw ? parseProfile(JSON.parse(raw)) : newProfile(), storageError: false }; }
  catch { return { profile: newProfile(), storageError: true }; }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [profile, setProfile] = useState(initial.profile);
  const [storageError, setStorageError] = useState(initial.storageError);
  const update = useCallback((fn: (p: Profile) => Profile) => setProfile(fn), []);
  useEffect(() => {
    if (storageError) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { setStorageError(true); }
  }, [profile, storageError]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try { setProfile(event.newValue ? parseProfile(JSON.parse(event.newValue)) : newProfile()); } catch { setStorageError(true); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (profile.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);
  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY); setStorageError(false); } catch { setStorageError(true); }
    setProfile(newProfile());
  };
  const restore = (next: Profile) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorageError(false); } catch { setStorageError(true); }
    setProfile(next);
  };
  return <Context.Provider value={{ profile, update, storageError, reset, restore }}>{children}</Context.Provider>;
}
export function useProfile() { const context = useContext(Context); if (!context) throw new Error('Missing ProfileProvider'); return context; }
