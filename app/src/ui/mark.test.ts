import { describe, expect, it } from 'vitest';
import { MidadMascot, renderMascot, validateMascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';

const animals = Object.keys(MidadMascot.ANIMALS);
const strip = (svg: string) => svg.replace(/mm\d+/g, 'mmN');

describe('penanda tokoh perempuan (mark: female)', () => {
  it('ada untuk kelima hewan dan menambah pita + rok tanpa mengubah gambar bila tidak dipakai', () => {
    expect(animals).toEqual(['hudhud', 'cat', 'camel', 'turtle', 'oryx']);
    for (const animal of animals) {
      const plain = strip(renderMascot({ animal }, { label: '' }));
      const female = strip(renderMascot({ animal, mark: 'female' }, { label: '' }));
      expect(female).not.toBe(plain);
      expect(female.length).toBeGreaterThan(plain.length);
      expect(female).toContain('#e56b8a');
      expect(plain).not.toContain('#e56b8a');
      expect(strip(renderMascot({ animal, mark: 'none' }, { label: '' }))).toBe(plain);
    }
  });
  it('validateMascotConfig hanya menerima nilai yang dikenal dan tidak menambah kunci bila tidak diminta', () => {
    expect(validateMascotConfig({ animal: 'cat', mark: 'female' }).mark).toBe('female');
    expect('mark' in validateMascotConfig({ animal: 'cat' })).toBe(false);
    expect('mark' in validateMascotConfig({ animal: 'cat', mark: 'none' })).toBe(false);
    for (const bad of ['__proto__', 'constructor', '<x>', 7, null]) expect('mark' in validateMascotConfig({ mark: bad })).toBe(false);
  });
  it('bukan item lemari: tidak ada di daftar HEAD/NECK/HAND/SKINS', () => {
    for (const list of [MidadMascot.HEAD, MidadMascot.NECK, MidadMascot.HAND, MidadMascot.SKINS]) expect(Object.keys(list)).not.toContain('female');
  });
  it('bersih dari teks (tanpa <text>) dan tanpa gambar eksternal', () => {
    for (const animal of animals) {
      const svg = renderMascot({ animal, mark: 'female' }, { label: '' });
      expect(svg).not.toMatch(/<text|<image|href=/);
    }
  });
});