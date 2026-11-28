import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import tr from './wardrobeTr.json';

// Setiap istilah Arab di lemari (NAMES, ANIMALS, SLOTS) punya terjemahan ID/EN; tidak ada Arab baru di berkas terjemahan.
const src = readFileSync('app/src/screens/Wardrobe.tsx', 'utf8');
const keysOf = (re: RegExp) => [...(src.match(re)?.[1] ?? '').matchAll(/(\w+):\s*'/g)].map(m => m[1]);
const names = keysOf(/const NAMES[^=]*= \{([\s\S]*?)\n\};/), animals = keysOf(/const ANIMALS = \{([^}]*)\}/);
const slots = [...(src.match(/const SLOTS[^=]*= (\[[\s\S]*?\]);/)?.[1] ?? '').matchAll(/key: '(\w+)'/g)].map(m => m[1]);

describe('terjemahan istilah lemari', () => {
  it('semua nama, hewan, dan kategori punya terjemahan ID dan EN yang tidak kosong', () => {
    expect(names.length).toBeGreaterThan(80); expect(animals).toHaveLength(5); expect(slots).toHaveLength(9);
    for (const [group, keys] of [['names', names], ['animals', animals], ['slots', slots]] as const) {
      const table = tr[group] as Record<string, { id: string; en: string }>;
      expect(keys.filter(k => !table[k]?.id || !table[k]?.en), group).toEqual([]);
      expect(Object.keys(table).filter(k => !keys.includes(k)), `${group} berlebih`).toEqual([]);
    }
    for (const k of ['save', 'buy', 'poor', 'locked', 'saved']) expect((tr.ui as Record<string, { id: string; en: string }>)[k]?.id).toBeTruthy();
  });
  it('berkas terjemahan tidak berisi huruf Arab (Arab hanya dari app/Shaharil)', () => {
    expect(JSON.stringify(tr)).not.toMatch(/[\u0600-\u06FF]/);
  });
});