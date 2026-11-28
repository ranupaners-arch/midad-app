import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import tr from './wardrobeTr.json';

// Koreksi Shaharil (bagian A, 28 Nov): ID/EN disamakan dengan arti kata Arab di app. Semua: cek user.
const KOREKSI: Record<string, [string, string]> = {
  teal: ['Biru pirus', 'Turquoise'], lavender: ['Ungu', 'Violet'], ginger: ['Pirang kemerahan', 'Ginger'], sand: ['Warna pasir', 'Sandy'], olive: ['Hijau zaitun', 'Olive green'],
  coral: ['Merah koral', 'Coral'], rose: ['Merah muda terang', 'Light pink'], swept: ['Terurai', 'Flowing'], tabby: ['Bergaris', 'Striped'], patches: ['Belang-belang', 'Patchy'],
  fringe: ['Poni', 'Fringe'], gold: ['Keemasan', 'Golden'], frown: ['Sedih', 'Sad'], dhow: ['Kapal', 'Ship'], scholar: ['Ulama', 'Scholar'],
};

describe('koreksi terjemahan lemari (Shaharil, bagian A)', () => {
  it('15 istilah memakai teks ID/EN dari Shaharil apa adanya', () => {
    const names = tr.names as Record<string, { id: string; en: string }>;
    for (const [key, [id, en]] of Object.entries(KOREKSI)) expect(names[key], key).toEqual({ id, en });
    expect(Object.keys(KOREKSI)).toHaveLength(15);
  });
  it('istilah yang tidak disebut Shaharil tetap seperti draf (sudah cocok)', () => {
    const names = tr.names as Record<string, { id: string; en: string }>;
    expect(names.happy).toEqual({ id: 'Bahagia', en: 'Happy' }); expect(names.black).toEqual({ id: 'Hitam', en: 'Black' }); expect(names.qalam).toEqual({ id: 'Pena kalam', en: 'Qalam pen' });
  });
  it('bagian B (usulan mengganti teks Arab) TIDAK diterapkan: Arab di Wardrobe.tsx tidak berubah, menunggu keputusan user', () => {
    const src = readFileSync('app/src/screens/Wardrobe.tsx', 'utf8');
    for (const kept of ['أَدَوَاتٌ', 'بَنَفْسَجِيٌّ', 'حَزِينٌ', 'سَفِينَةٌ', 'عَالِمٌ', 'قَصِيرٌ', 'سَادَةٌ']) expect(src, kept).toContain(kept);
    for (const notApplied of ['الْأَدَوَاتُ', 'خُزَامِيٌّ', 'عَابِسٌ', 'سَفِينَةٌ شِرَاعِيَّةٌ', 'جُبَّةُ الْعَالِمِ', 'خُصْلَةٌ', 'بِلَا نَقْشٍ']) expect(src, notApplied).not.toContain(notApplied);
  });
  it('catatan berkas menyebut koreksi dan status "cek user"; tetap tanpa huruf Arab', () => {
    const note = (tr as { _catatan: string })._catatan;
    expect(note).toMatch(/Shaharil/); expect(note).toMatch(/cek user/); expect(JSON.stringify(tr)).not.toMatch(/[؀-ۿ]/);
  });
});
