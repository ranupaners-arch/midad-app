import { describe, expect, it } from 'vitest';
import routes from '../../../design-system/assets/rihlah/routes.json';
import { MidadVehicles } from '../../../design-system/assets/maskot/vehicles.mjs';
import oman from './omanTexts.json';

describe('halaman demo Oman: teks Shaharil dan data app', () => {
  it('teks lengkap: banner, 3 label, 3 kosakata budaya (+ keterangan id/en tanpa Arab), 2 tombol, keterangan pratinjau', () => {
    for (const s of [oman.banner, oman.label.region, oman.label.vehicle, oman.label.vocab, oman.btn.replay, oman.btn.back, oman.previewNote, ...oman.vocab]) {
      expect(s.ar).toMatch(/[ً-ْ]/); expect(s.id.length).toBeGreaterThan(2); expect(s.en.length).toBeGreaterThan(2);
    }
    expect(oman.vocab).toHaveLength(3);
    for (const v of oman.vocab) { expect(v.note.ar).toBe(''); expect(v.note.id.length).toBeGreaterThan(10); expect(v.note.en.length).toBeGreaterThan(10); }
  });
  it('kalimat kedatangan memakai bentuk setelah إِلَى (fathah, مَسْقَطَ), bukan bentuk dasar', () => {
    expect(oman.portAfterIla.ar.endsWith('َ')).toBe(true);
    expect(oman.banner.ar).toContain(oman.portAfterIla.ar);
    expect(oman.banner.ar).not.toContain(oman.portName.ar + '!');
  });
  it('jujur: keterangan pratinjau ada, dan tidak ada teks yang menyebut level 17', () => {
    expect(oman.previewNote.id.toLowerCase()).toContain('pratinjau');
    expect(JSON.stringify(oman)).not.toMatch(/17|١٧/);
  });
  it('data app: rute Oman = عُمَانُ, kendaraan baghlah (بَغْلَة), pelabuhan pertama Muscat', () => {
    const route = routes.routes.id[2];
    expect(route.region.ar).toBe('عُمَانُ'); expect(route.vehicle).toBe('baghlah'); expect(route.ports[0]).toBe('Muscat');
    expect(MidadVehicles.V.baghlah.name[0]).toBe('بَغْلَة');
  });
});
