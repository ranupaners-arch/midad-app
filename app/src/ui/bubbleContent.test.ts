import { describe, expect, it } from 'vitest';
import texts from '../domain/companionTexts.json';
import { BUBBLE_COUNTS, BUBBLE_KINDS, bubbleAt } from '../ui/bubbleContent';

describe('isi balon companion', () => {
  it('teks Shaharil lengkap: tips, motivasi, mahfuzhat, masing-masing Arab berharakat + id + en', () => {
    for (const kind of ['tip', 'motivasi', 'mahfuzhat'] as const) {
      expect(texts[kind].length, kind).toBeGreaterThanOrEqual(5);
      for (const s of texts[kind]) { expect(s.ar).toMatch(/[\u064B-\u0652]/); expect(s.id.length).toBeGreaterThan(5); expect(s.en.length).toBeGreaterThan(5); }
    }
  });
  it('bergilir antar empat jenis dan setiap teks akhirnya tampil, lalu mengulang', () => {
    const turns = 4 * 40, seen = new Set<string>();
    for (let n = 0; n < turns; n++) {
      const b = bubbleAt(n);
      expect(b.kind).toBe(BUBBLE_KINDS[n % 4]);
      expect(b.text.ar.length).toBeGreaterThan(5);
      seen.add(`${b.kind}:${b.id}`);
    }
    expect(seen.size).toBe(BUBBLE_COUNTS.item + BUBBLE_COUNTS.tip + BUBBLE_COUNTS.motivasi + BUBBLE_COUNTS.mahfuzhat);
    expect(bubbleAt(0).id).toBe('xp.use'); expect(bubbleAt(1).id).toBe('tip.1'); expect(bubbleAt(2).id).toBe('motivasi.1'); expect(bubbleAt(3).id).toBe('mahfuzhat.1'); expect(bubbleAt(4).id).toBe('xp.get');
    expect(bubbleAt(4 * BUBBLE_COUNTS.item).id).toBe(bubbleAt(0).id);
  });
});