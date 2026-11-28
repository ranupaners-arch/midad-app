import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Server dev untuk tes bawaan berjalan dengan VITE_DEMO_UNLOCK_ALL=0 (ekonomi asli); di sini ?demo=1 / ?demo=0 memaksa.
async function open(page: Page, demo: '0' | '1', changes: object = {}) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto(`/?demo=${demo}#/wardrobe`);
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
}
const stored = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
const tab = (page: Page, n: number) => page.locator('.customization-tabs button').nth(n).click();
const save = (page: Page) => page.locator('.wardrobe-save .md-btn');

test('mode demo menyala: oryx + skin emas + kepala/leher/tangan premium bisa dipakai tanpa kurma; kurma dan owned* tetap utuh', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, '1');
  await page.locator('.animal-picker label').nth(4).click();            // oryx (terkunci di aturan asli)
  await tab(page, 8); await page.locator('.customization-option').nth(8).click();   // skin goldbisht (tanpa harga di aturan asli)
  await tab(page, 6); await page.locator('.customization-option').nth(2).click();   // kepala mussar (80 kurma)
  await tab(page, 5); await page.locator('.customization-option').nth(7).click();   // tangan telescope
  await expect(save(page)).toBeEnabled();
  await save(page).click();
  await expect(page.locator('.saved-message')).toBeVisible();
  const s = await stored(page);
  expect(s.mascot).toMatchObject({ animal: 'oryx', skin: 'goldbisht', head: 'mussar', hand: 'telescope' });
  expect(s.dates).toBe(0);
  expect(s.ownedSkins).toEqual(['none']); expect(s.ownedAnimals).toEqual(['hudhud']);
  expect(s.ownedItems).not.toContain('head:mussar');
  await page.reload();
  expect((await stored(page)).mascot).toMatchObject({ animal: 'oryx', skin: 'goldbisht' });
  expect(errors).toEqual([]);
});

test('mode demo menyala: opsi yang terbuka lewat demo diberi penanda "Demo" (hewan dan perlengkapan)', async ({ page }) => {
  await open(page, '1');
  await expect(page.locator('.animal-picker .demo-badge')).toHaveCount(4);   // kucing, unta, penyu, oryx
  await tab(page, 8);
  await expect(page.locator('.customization-option .demo-badge').first()).toHaveText('Demo');
  await tab(page, 0);                                                         // warna selalu gratis: tanpa penanda
  await expect(page.locator('.customization-option .demo-badge')).toHaveCount(0);
});

test('mode demo mati (?demo=0): aturan asli (oryx dan skin emas terkunci, tanpa penanda)', async ({ page }) => {
  await open(page, '0');
  await expect(page.locator('.demo-badge')).toHaveCount(0);
  await page.locator('.animal-picker label').nth(4).click();
  await expect(save(page)).toBeDisabled();
  await page.locator('.animal-picker label').nth(0).click();
  await tab(page, 8); await page.locator('.customization-option').nth(8).click();
  await expect(save(page)).toBeDisabled();
});

test('mode demo mati: membeli tetap memotong kurma sesuai harga (ekonomi asli utuh)', async ({ page }) => {
  await open(page, '0', { dates: 50 });
  await tab(page, 6); await page.locator('.customization-option').nth(3).click();   // kepala peci (30 kurma)
  await save(page).click();
  const s = await stored(page);
  expect(s.dates).toBe(20); expect(s.ownedItems).toContain('head:peci');
});

for (const scheme of ['light', 'dark'] as const) test(`lemari dalam mode demo lolos axe (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, '1');
  await tab(page, 8);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
