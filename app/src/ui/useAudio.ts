import { useCallback, useEffect, useRef, useState } from 'react';
import { pickArabicVoice } from '../domain/speech';

export function useAudio() {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setAvailable(!!pickArabicVoice(speechSynthesis.getVoices(), navigator.onLine));
    load(); speechSynthesis.addEventListener('voiceschanged', load);
    window.addEventListener('online', load); window.addEventListener('offline', load);
    return () => { speechSynthesis.removeEventListener('voiceschanged', load); window.removeEventListener('online', load); window.removeEventListener('offline', load); if (utterance.current) { utterance.current.onend = null; utterance.current.onerror = null; speechSynthesis.cancel(); } };
  }, []);
  const speak = useCallback((text: string, slow = false) => {
    if (!('speechSynthesis' in window)) return false;
    const voice = pickArabicVoice(speechSynthesis.getVoices(), navigator.onLine);
    if (!voice) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang; u.voice = voice; u.rate = slow ? .75 : 1;
    u.onend = () => setPlaying(false); u.onerror = () => setPlaying(false);
    utterance.current = u; setPlaying(true); speechSynthesis.speak(u); return true;
  }, []);
  return { available, playing, speak };
}

type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; abort: () => void;
};
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function useRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false), [error, setError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const ref = useRef<Recognition | null>(null), callback = useRef(onResult);
  callback.current = onResult;
  const win = window as SpeechWindow;
  const Constructor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  useEffect(() => () => { if (ref.current) { ref.current.onresult = null; ref.current.onerror = null; ref.current.onend = null; ref.current.abort(); } }, []);
  useEffect(() => {
    const connected = () => setOnline(true);
    const disconnected = () => { setOnline(false); ref.current?.abort(); };
    window.addEventListener('online', connected); window.addEventListener('offline', disconnected);
    return () => { window.removeEventListener('online', connected); window.removeEventListener('offline', disconnected); };
  }, []);
  const start = () => {
    if (!Constructor || listening || !online) return;
    const r = new Constructor(); ref.current = r; r.lang = 'ar-SA'; r.interimResults = false; r.continuous = false;
    r.onresult = e => callback.current(e.results[0][0].transcript);
    r.onerror = e => setError(e.error === 'not-allowed' ? 'لَمْ يُسْمَحْ بِاسْتِخْدَامِ الْمِيكْرُوفُونِ. يُمْكِنُكَ الْمُتَابَعَةُ بِدُونِهِ.' : 'تَعَذَّرَ التَّعَرُّفُ عَلَى الصَّوْتِ. حَاوِلْ مَرَّةً أُخْرَى أَوْ تَابِعْ بِدُونِ الْمِيكْرُوفُونِ.');
    r.onend = () => setListening(false);
    try { setError(''); setListening(true); r.start(); } catch { setListening(false); setError('تَعَذَّرَ تَشْغِيلُ الْمِيكْرُوفُونِ.'); }
  };
  return { supported: !!Constructor && online, listening, error, start, stop: () => ref.current?.abort() };
}

let context: AudioContext | undefined;
export function feedbackSound(correct: boolean) {
  if (!('AudioContext' in window)) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(correct ? 660 : 220, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 880 : 180, context.currentTime + .12);
    gain.gain.setValueAtTime(.07, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .2);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .22);
  } catch { /* Visual feedback remains available if the audio device is unavailable. */ }
}
