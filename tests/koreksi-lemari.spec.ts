import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Koreksi terjemahan lemari dari Shaharil tampil di bawah nama Arabnya (cek user). Warna hudhud: tab pertama «اللَّوْنُ».
async function open(page: Page, language: 'id' | 'en') {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language, dates: 120 };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/?demo=1#/wardrobe');
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
}
const option = (page: Page, arabic: string) => page.getByRole('radio', { name: arabic, exact: true }).locator('..');

test('warna hudhud: «فَيْرُوزِيٌّ» = Biru pirus, «بَنَفْسَجِيٌّ» = Ungu (ID)', async ({ page }) => {
  await open(page, 'id');
  await expect(option(page, 'فَيْرُوزِيٌّ').locator('.translation')).toHaveText('Biru pirus');
  await expect(option(page, 'بَنَفْسَجِيٌّ').locator('.translation')).toHaveText('Ungu');
  await expect(option(page, 'بُرْتُقَالِيٌّ').locator('.translation')).toHaveText('Jingga');   // yang tidak dikoreksi tetap
});

test('bahasa Inggris: Turquoise dan Violet', async ({ page }) => {
  await open(page, 'en');
  await expect(option(page, 'فَيْرُوزِيٌّ').locator('.translation')).toHaveText('Turquoise');
  await expect(option(page, 'بَنَفْسَجِيٌّ').locator('.translation')).toHaveText('Violet');
});

test('pakaian dan alat: «بِشْتٌ ذَهَبِيٌّ» tetap «Bisyt emas» dan «سَفِينَةٌ» = Kapal; axe bersih', async ({ page }) => {
  await open(page, 'id');
  await page.locator('.customization-tabs button').nth(8).click();                          // pakaian
  await expect(option(page, 'بِشْتٌ ذَهَبِيٌّ').locator('.translation')).toHaveText('Bisyt emas');
  await page.locator('.customization-tabs button').nth(5).click();                          // alat
  await expect(option(page, 'سَفِينَةٌ').locator('.translation')).toHaveText('Kapal');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
