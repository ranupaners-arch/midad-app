import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Area tap >= 44x44 untuk kontrol kecil (WCAG 2.5.5 / saran Wiljasin): ikon info "?", pil penghitung di tajuk, companion kecil di layar belajar HP.
async function seed(page: Page, size: { width: number; height: number }) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id', dates: 120, xp: 310 };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(size);
}
const boxes = (page: Page, selector: string) => page.locator(selector).evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
const SIZES = [{ width: 360, height: 812 }, { width: 320, height: 568 }, { width: 1280, height: 800 }];

for (const size of SIZES) test(`area tap >= 44x44: ikon info (Profil dan panel kanan) dan pil penghitung, ${size.width}x${size.height}`, async ({ page }) => {
  await seed(page, size);
  await page.goto('/#/profile');
  await expect(page.locator('.stats-row')).toBeVisible();
  const stats = await boxes(page, '.stats-row button.stat'); expect(stats).toHaveLength(3);
  for (const [w, h] of stats) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
  const infos = await boxes(page, '.info-button:visible'); expect(infos.length).toBeGreaterThanOrEqual(3);
  for (const [w, h] of infos) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
  if (size.width >= 900) { await page.goto('/#/'); const aside = await boxes(page, '.journey-aside .info-button:visible'); expect(aside.length).toBe(1); expect(aside[0][0]).toBeGreaterThanOrEqual(44); expect(aside[0][1]).toBeGreaterThanOrEqual(44); }
});

test('ikon info tetap kecil secara visual dan tidak menutupi isi kartu; tetap membuka lembar penjelasan', async ({ page }) => {
  await seed(page, SIZES[0]);
  await page.goto('/#/profile');
  const tile = page.locator('.profile-stats > div').first(), button = tile.locator('.info-button');
  const circle = await button.evaluate(el => { const s = getComputedStyle(el, '::before'); return [parseFloat(s.width), parseFloat(s.height)]; });
  expect(circle[0]).toBeLessThanOrEqual(34); expect(circle[1]).toBeLessThanOrEqual(34);
  const count = await tile.locator('b.number').evaluate(el => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }), tap = (await button.boundingBox())!;   // kotak teks angka (bukan kotak blok selebar kartu)
  expect(count.x + count.width <= tap.x || count.x >= tap.x + tap.width || count.y >= tap.y + tap.height || count.y + count.height <= tap.y).toBe(true);   // angka tidak tertimpa area tap
  await button.click();
  await expect(page.getByTestId('item-info')).toBeVisible();
});

test('companion kecil di layar belajar HP berukuran tap >= 44x44 dan bar atas tidak membungkus', async ({ page }) => {
  await seed(page, SIZES[0]);
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.study-card')).toBeVisible();
  const [[w, h]] = await boxes(page, '.lesson-companion');
  expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44);
  const header = (await page.locator('.lesson-header').boundingBox())!, close = (await page.locator('.lesson-header a').boundingBox())!;
  expect(Math.abs(close.y - header.y)).toBeLessThan(20);
});