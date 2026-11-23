import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
type PwaState = { supported: boolean; online: boolean; ready: boolean; updateAvailable: boolean; registrationError: boolean; updateError: boolean; installError: boolean; installing: boolean; installed: boolean; canInstall: boolean; install: () => Promise<void>; applyUpdate: () => Promise<void> };
const Context = createContext<PwaState | null>(null);
export function PwaProvider({ children }: { children: ReactNode }) {
  const supported = 'serviceWorker' in navigator && window.isSecureContext;
  const [online, setOnline] = useState(navigator.onLine), [ready, setReady] = useState(false), [registrationError, setRegistrationError] = useState(false), [updateError, setUpdateError] = useState(false), [installError, setInstallError] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false), [currentRegistration, setCurrentRegistration] = useState<ServiceWorkerRegistration>();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null), [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const applyingUpdate = useRef(false);
  useEffect(() => {
    if (!import.meta.env.PROD || !supported) return;
    let cancelled = false;
    const url = new URL('sw.js', document.baseURI);
    // VitePWA generates the precache worker; native lifecycle events keep updates opt-in.
    void navigator.serviceWorker.register(url, { scope: new URL('.', url).pathname, updateViaCache: 'none' }).then(value => {
      if (cancelled) return;
      registration.current = value; setCurrentRegistration(value);
      if (value.active) setReady(true);
      void navigator.serviceWorker.ready.then(() => { if (!cancelled) setReady(true); });
    }).catch(() => { if (!cancelled) setRegistrationError(true); });
    const changed = () => {
      setReady(true); setUpdateAvailable(!!registration.current?.waiting);
      if (applyingUpdate.current) { applyingUpdate.current = false; window.location.reload(); }
    };
    navigator.serviceWorker.addEventListener('controllerchange', changed);
    return () => { cancelled = true; navigator.serviceWorker.removeEventListener('controllerchange', changed); };
  }, [supported]);
  useEffect(() => {
    if (!currentRegistration) return;
    let installing: ServiceWorker | null = null;
    const changed = () => setUpdateAvailable(!!currentRegistration.waiting || installing?.state === 'installed' && !!currentRegistration.active);
    const watch = () => { installing?.removeEventListener('statechange', changed); installing = currentRegistration.installing; installing?.addEventListener('statechange', changed); changed(); };
    currentRegistration.addEventListener('updatefound', watch); watch();
    return () => { currentRegistration.removeEventListener('updatefound', watch); installing?.removeEventListener('statechange', changed); };
  }, [currentRegistration]);
  useEffect(() => {
    const checkForUpdate = () => { if (navigator.onLine) void registration.current?.update().catch(() => {}); };
    const connected = () => { setOnline(true); checkForUpdate(); };
    const disconnected = () => setOnline(false);
    const offerInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const installedApp = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('online', connected); window.addEventListener('offline', disconnected);
    window.addEventListener('beforeinstallprompt', offerInstall); window.addEventListener('appinstalled', installedApp);
    window.addEventListener('focus', checkForUpdate);
    return () => {
      window.removeEventListener('online', connected); window.removeEventListener('offline', disconnected);
      window.removeEventListener('beforeinstallprompt', offerInstall); window.removeEventListener('appinstalled', installedApp);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);
  const install = async () => {
    if (!prompt || installing) return;
    setInstalling(true);
    setInstallError(false);
    try { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setInstalled(true); }
    catch { setInstallError(true); }
    finally { setPrompt(null); setInstalling(false); }
  };
  const applyUpdate = async () => {
    setUpdateError(false);
    try {
      const worker = registration.current?.waiting;
      if (worker) { applyingUpdate.current = true; worker.postMessage({ type: 'SKIP_WAITING' }); }
      else { setUpdateAvailable(false); await registration.current?.update(); }
    } catch { applyingUpdate.current = false; setUpdateError(true); }
  };
  return <Context.Provider value={{ supported, online, ready, updateAvailable, registrationError, updateError, installError, installing, installed, canInstall: !!prompt, install, applyUpdate }}>{children}</Context.Provider>;
}
export function usePwa() { const state = useContext(Context); if (!state) throw new Error('Missing PwaProvider'); return state; }
