import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoUnlockAll } from './demo';
import { createProfile, equipMascot, parseProfile, purchase } from './progress';

const base = () => ({ ...createProfile(), dates: 12 });
const premium = { animal: 'oryx', color: 'rose', skin: 'goldbisht', head: 'mussar', neck: 'scarf', hand: 'telescope' };
afterEach(() => vi.unstubAllGlobals());

describe('mode demo: semua opsi companion terbuka', () => {
  it('bawaan tes = mati (VITE_DEMO_UNLOCK_ALL=0); ?demo=1 menyalakan, ?demo=0 mematikan', () => {
    expect(demoUnlockAll()).toBe(false);
    vi.stubGlobal('location', { search: '?demo=1' }); expect(demoUnlockAll()).toBe(true);
    vi.stubGlobal('location', { search: '?demo=0' }); expect(demoUnlockAll()).toBe(false);
  });
  it('mati: ekonomi asli (barang terkunci ditolak)', () => {
    expect(equipMascot(base(), premium).mascot).toEqual(base().mascot);
  });
  it('menyala: companion premium dipakai tanpa membeli; kurma dan daftar owned* tidak berubah', () => {
    vi.stubGlobal('location', { search: '?demo=1' });
    const p = base(), next = equipMascot(p, premium);
    expect(next.mascot).toMatchObject(premium);
    expect(next.dates).toBe(12);
    expect(next.ownedSkins).toEqual(p.ownedSkins); expect(next.ownedItems).toEqual(p.ownedItems);
    expect(next.ownedAnimals).toEqual(p.ownedAnimals);
  });
  it('menyala: pembelian asli tetap memakai harga (tidak gratis lewat purchase)', () => {
    vi.stubGlobal('location', { search: '?demo=1' });
    expect(purchase(base(), 'skin', 'batik').dates).toBe(12);
    expect(purchase({ ...base(), dates: 200 }, 'skin', 'vest').dates).toBe(100);
  });
  it('parseProfile: pilihan demo bertahan saat menyala dan kembali ke bawaan (tanpa error/rusak) saat dimatikan', () => {
    vi.stubGlobal('location', { search: '?demo=1' });
    const saved = JSON.parse(JSON.stringify(equipMascot(base(), premium)));
    expect(parseProfile(saved).mascot).toMatchObject(premium);
    vi.stubGlobal('location', { search: '?demo=0' });
    const off = parseProfile(saved);
    expect(off.mascot.animal).toBe('hudhud'); expect(off.mascot.skin).toBe('none'); expect(off.dates).toBe(12);
  });
});