import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

async function open(page: Page, viewport = { width: 1280, height: 800 }) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', xp: 310, dates: 120 };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto('/#/profile');
  await expect(page.locator('.stats-row')).toBeVisible();
}
const loaded = (page: Page, selector: string) => page.locator(selector).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);

for (const scheme of ['light', 'dark'] as const) test(`ikon kurma dan lentera WebP tampil di bar atas dan kartu harian (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page);
  for (const selector of ['.stat-dates img.icon-img', '.stat-streak img.icon-img']) {   // kartu statistik Profil tidak lagi memakai ikon (beranda-profil-ringkas)
    await expect(page.locator(selector).first()).toHaveAttribute('src', /\.webp/);
    await expect.poll(() => loaded(page, selector)).toBe(true);
  }
  await expect(page.locator('.daily-card img.icon-img')).toHaveCount(1);
  await expect(page.locator('.stat-xp svg.icon')).toHaveCount(1);        // bintang tetap ikon garis
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('ikon HP 375 px: kurma dan lentera tidak merusak bar atas', async ({ page }) => {
  await open(page, { width: 375, height: 760 });
  const bar = await page.locator('.stats-row').boundingBox(), dates = await page.locator('.stat-dates img').boundingBox();
  expect(bar && dates && dates.x >= bar.x && dates.x + dates.width <= bar.x + bar.width + 1).toBe(true);
  expect(dates!.width).toBeGreaterThanOrEqual(24);
});

test('gambar ikon gagal dimuat: jatuh ke ikon garis SVG lama tanpa error', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.route(/\/assets\/icons\/[^?]*\.webp$/, route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  await open(page);
  await expect(page.locator('.stat-dates svg.icon')).toBeVisible();
  await expect(page.locator('.stat-streak svg.icon')).toBeVisible();
  await expect(page.locator('.stat img.icon-img')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('bar atas HP 375 px di lemari (halaman penuh layar): tombol terjemahan tetap satu baris dengan penghitung', async ({ page }) => {
  await open(page, { width: 375, height: 760 });
  await page.goto('/#/wardrobe');
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
  const stats = await page.locator('.stats-row').boundingBox(), toggle = await page.locator('.translation-toggle').boundingBox();
  expect(stats && toggle && toggle.y < stats.y + stats.height).toBe(true);
});
