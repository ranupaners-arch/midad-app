import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHAHARIL_UNITS } from './content';
import aiLabel from './aiLabel.json';
import { friendAnimal, SCENE_DEFS, SCENE_KEYS, sceneFor, sceneKey } from './scenes';

const vocabDir = 'app/src/assets/vocab', emojiDir = 'app/src/assets/emoji';
const words = SHAHARIL_UNITS.flatMap(u => u.words).filter(w => w.audioKey);

describe('ilustrasi kosakata: pemetaan', () => {
  it('audioKey materi diubah menjadi kunci adegan', () => {
    expect(sceneKey('w01/v05')).toBe('w1-v05');
    expect(sceneKey('w02/v14')).toBe('w2-v14');
    expect(sceneKey('w12/v103')).toBe('w12-v103');
    expect(sceneKey(undefined)).toBeUndefined();
    expect(sceneKey('abc')).toBeUndefined();
  });
  it('setiap entri peta cocok dengan satu kosakata di materi Shaharil (tidak ada kunci salah ketik)', () => {
    const keys = new Set(words.map(w => sceneKey(w.audioKey)));
    expect(words.length).toBeGreaterThan(0);
    expect(SCENE_KEYS.filter(k => !keys.has(k))).toEqual([]);
    expect(words.filter(w => sceneFor(w.audioKey)).length).toBe(SCENE_KEYS.length);
  });
  it('kosakata tanpa adegan (angka, huruf, dll.) tidak error dan jatuh ke ikon lama', () => {
    expect(sceneFor('w03/v01')).toBeUndefined();
    expect(sceneFor(undefined)).toBeUndefined();
  });
  it('setiap entri peta menunjuk ke berkas gambar dan emoji yang ada', () => {
    for (const k of SCENE_KEYS) {
      const d = SCENE_DEFS[k];
      expect(existsSync(`${vocabDir}/${d.scene}.webp`), `${k} -> ${d.scene}.webp`).toBe(true);
      if (d.emoji) expect(existsSync(`${emojiDir}/${d.emoji}.svg`), `${k} -> ${d.emoji}.svg`).toBe(true);
      expect(['solo', 'duo', 'pojok', 'none']).toContain(d.mode);
    }
  });
  it('tidak ada berkas gambar yatim di aset ilustrasi', () => {
    const used = new Set(SCENE_KEYS.map(k => `${SCENE_DEFS[k].scene}.webp`));
    const emojis = new Set(SCENE_KEYS.map(k => SCENE_DEFS[k].emoji).filter(Boolean).map(e => `${e}.svg`));
    const strayPng = readdirSync(vocabDir).filter(f => !used.has(f));
    const strayEmoji = readdirSync(emojiDir).filter(f => !emojis.has(f));
    // adegan cadangan boleh ada; emoji tidak (semua emoji dipakai kata)
    expect(strayEmoji).toEqual([]);
    expect(strayPng.length).toBeLessThanOrEqual(4);
  });
  it('lisensi emoji tersedia di public/licenses', () => {
    expect(readFileSync('app/public/licenses/twemoji.txt', 'utf8')).toMatch(/CC-BY 4\.0/);
  });
  it('kata perempuan hanya di adegan berdua', () => {
    for (const k of SCENE_KEYS) if (SCENE_DEFS[k].friendFemale) expect(SCENE_DEFS[k].mode).toBe('duo');
  });
});

describe('ilustrasi kosakata: teman pendamping', () => {
  it('kucing, atau Hudhud bila pengguna memilih kucing', () => {
    expect(friendAnimal('hudhud')).toBe('cat');
    expect(friendAnimal('camel')).toBe('cat');
    expect(friendAnimal('cat')).toBe('hudhud');
  });
});

describe('keterangan ilustrasi AI', () => {
  it('teks Arab (dari Shaharil) berharakat dan ada terjemahan ID/EN', () => {
    expect(aiLabel.ar).toMatch(/[\u0621-\u064A]/);
    expect(aiLabel.ar).toMatch(/[\u064B-\u0652]/);
    expect(aiLabel.id).toBe('Ilustrasi menggunakan AI');
    expect(aiLabel.en.length).toBeGreaterThan(5);
  });
});