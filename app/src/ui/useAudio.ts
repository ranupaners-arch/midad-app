import { useCallback, useEffect, useRef, useState } from 'react';
import { pickArabicVoice } from '../domain/speech';

export function useAudio(recordingUrl?: string) {
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const recording = useRef<HTMLAudioElement | null>(null);

  const release = useCallback(() => {
    const clip = recording.current;
    if (clip) {
      recording.current = null;
      clip.onended = null;
      clip.onerror = null;
      clip.pause();
    }
    const u = utterance.current;
    if (u) {
      utterance.current = null;
      u.onend = null;
      u.onerror = null;
      speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setVoiceAvailable(!!pickArabicVoice(speechSynthesis.getVoices(), navigator.onLine));
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    window.addEventListener('online', load);
    window.addEventListener('offline', load);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', load);
      window.removeEventListener('online', load);
      window.removeEventListener('offline', load);
    };
  }, []);

  useEffect(() => release, [release, recordingUrl]);

  const stop = useCallback(() => { release(); setPlaying(false); }, [release]);
  const speakSynthetic = useCallback((text: string, rate: number) => {
    if (!('speechSynthesis' in window)) return false;
    const voice = pickArabicVoice(speechSynthesis.getVoices(), navigator.onLine);
    if (!voice) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.voice = voice;
    u.rate = rate;
    const finish = () => {
      if (utterance.current !== u) return;
      utterance.current = null;
      setPlaying(false);
    };
    u.onend = finish;
    u.onerror = finish;
    utterance.current = u;
    setPlaying(true);
    speechSynthesis.speak(u);
    return true;
  }, []);

  const hasRecording = !!recordingUrl && failedUrl !== recordingUrl;
  const speak = useCallback((text: string, slow = false) => {
    stop();
    const rate = slow ? 0.75 : 1;
    if (!hasRecording || !recordingUrl) return speakSynthetic(text, rate);

    const clip = new Audio(recordingUrl);
    recording.current = clip;
    clip.playbackRate = rate;
    clip.onended = () => {
      if (recording.current === clip) stop();
    };
    const failed = () => {
      if (recording.current !== clip) return;
      stop();
      setFailedUrl(recordingUrl);
      speakSynthetic(text, rate);
    };
    clip.onerror = failed;
    setPlaying(true);
    void clip.play().catch(failed);
    return true;
  }, [hasRecording, recordingUrl, speakSynthetic, stop]);

  return { available: hasRecording || voiceAvailable, playing, speak, stop };
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
