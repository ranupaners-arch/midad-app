import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, localDay, STORAGE_KEY } from '../app/src/domain/progress';

// Bilah atas di HP sempit: tombol terjemahan tidak terpotong, tidak ada gulir horizontal, area tap tetap >= 44x44, angka sampai 4 digit muat (RTL, terang+gelap).
const days = (n: number) => Array.from({ length: n }, (_, i) => localDay(new Date(Date.now() - i * 86_400_000)));
const CASES = [
  { name: 'biasa (45 XP, 7 kurma, streak 0)', changes: { xp: 45, dates: 7 } },
  { name: '3 digit (310 XP, 120 kurma, streak 120)', changes: { xp: 310, dates: 120, activityDays: days(120) } },
  { name: '4 digit (5000 XP, 1250 kurma, streak 120)', changes: { xp: 5000, dates: 1250, activityDays: days(120) } },
  { name: '5 digit (12000 XP, 12500 kurma)', changes: { xp: 12000, dates: 12500, activityDays: days(120) } },
];
const WIDTHS = [320, 360, 375];

async function open(page: Page, width: number, changes: object, hash = '/') {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id', ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width, height: 740 });
  await page.goto(`/#${hash}`);
  await expect(page.locator('.topbar .stats-row')).toBeVisible();
}
const rect = (page: Page, selector: string) => page.locator(selector).first().evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; });

for (const width of WIDTHS) for (const c of CASES) test(`bilah atas ${width} px: ${c.name}: semua kontrol utuh di layar, tanpa gulir horizontal, tap >= 44x44`, async ({ page }) => {
  await open(page, width, c.changes);
  expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const items = ['.topbar .mobile-logo', '.topbar .stat-streak', '.topbar .stat-dates', '.topbar .stat-xp', '.topbar .translation-toggle'];
  const boxes = [];
  for (const s of items) {
    const b = await rect(page, s); boxes.push({ s, ...b });
    expect(b.x, `${s} kiri`).toBeGreaterThanOrEqual(0); expect(b.r, `${s} kanan`).toBeLessThanOrEqual(width + 0.5);        // tidak terpotong di tepi
  }
  for (const b of boxes.slice(1)) { expect(b.w, `${b.s} lebar`).toBeGreaterThanOrEqual(44); expect(b.h, `${b.s} tinggi`).toBeGreaterThanOrEqual(44); }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {                                          // tidak saling menimpa
    const a = boxes[i], b = boxes[j], overlap = Math.min(a.r, b.r) - Math.max(a.x, b.x) > 0.5 && Math.min(a.b, b.b) - Math.max(a.y, b.y) > 0.5;
    expect(overlap, `${a.s} menimpa ${b.s}`).toBe(false);
  }
  const text = await page.locator('.stat b.number').allInnerTexts();                                                         // angkanya utuh (bukan disingkat/terpotong)
  expect(text.join(' ')).toContain(String(c.changes.xp));
  expect(await page.locator('.stat b.number').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
  const toggle = await rect(page, '.topbar .translation-toggle'); expect(toggle.w).toBeGreaterThanOrEqual(44); expect(toggle.h).toBeGreaterThanOrEqual(44);
});

for (const scheme of ['light', 'dark'] as const) for (const width of [320, 360]) test(`bilah atas ${width} px (${scheme}, angka 4 digit) lolos axe dan tombol terjemahan tetap bisa ditekan`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, width, CASES[2].changes);
  expect((await new AxeBuilder({ page }).include('.topbar').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('.translation-toggle').click();                                                                          // terjangkau penuh oleh ketukan
  await expect(page.locator('.translation-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('halaman demo Oman: bilah atas 320 px juga utuh', async ({ page }) => {
  await open(page, 320, CASES[2].changes, '/demo/oman');
  const t = await rect(page, '.topbar .translation-toggle'); expect(t.x).toBeGreaterThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('layar lebar (1280 px) tidak berubah: pil penghitung tetap longgar', async ({ page }) => {
  await open(page, 1280, CASES[1].changes);
  const gap = await page.locator('.stats-row').evaluate(el => parseFloat(getComputedStyle(el).columnGap));
  expect(gap).toBeGreaterThanOrEqual(20);
});
