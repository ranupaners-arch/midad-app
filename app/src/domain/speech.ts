export function normalizeArabic(text: string): string {
  return text.normalize('NFKC').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/gu, '').replace(/[أإآٱ]/gu, 'ا').replace(/ى/gu, 'ي').replace(/ة/gu, 'ه').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/gu, ' ').trim();
}

export function pickArabicVoice<T extends { lang: string; localService: boolean }>(voices: T[], online: boolean): T | undefined {
  const arabic = voices.filter(voice => voice.lang.toLowerCase().startsWith('ar'));
  return arabic.find(voice => voice.localService) ?? (online ? arabic[0] : undefined);
}
function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const next = [i]; for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); row = next; }
  return row[b.length];
}
export function matchSpeech(target: string, transcript: string): { passed: boolean; ratio: number; missed: string[] } {
  const expected = normalizeArabic(target).split(' ').filter(Boolean), actual = normalizeArabic(transcript).split(' ').filter(Boolean);
  const missed = expected.filter((word, i) => distance(word, actual[i] ?? '') > Math.floor(word.length * .2));
  const ratio = expected.length ? (expected.length - missed.length) / Math.max(expected.length, actual.length) : 0;
  const criticalMissing = expected.some(w => ['لا', 'لم', 'ليس', 'ما'].includes(w) && !actual.includes(w));
  return { passed: ratio >= .8 && !criticalMissing, ratio, missed };
}
