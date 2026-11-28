import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createProfile, localDay, STORAGE_KEY } from '../app/src/domain/progress';

const info = JSON.parse(readFileSync('app/src/domain/itemInfo.json', 'utf8')) as Record<string, Record<'name' | 'use' | 'get', { ar: string; id: string; en: string }>>;
const CLOSE = 'إِغْلَاقٌ';
const days = [0, 1, 2].map(i => localDay(new Date(Date.now() - i * 86400000)));

async function open(page: Page, route = '/#/profile', viewport = { width: 1280, height: 800 }, changes: object = {}) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', xp: 310, dates: 120, activityDays: days, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto(route);
  await expect(page.locator('.stats-row')).toBeVisible();
}
const sheet = (page: Page) => page.getByTestId('item-info');

for (const [item, selector, value] of [['xp', '.stat-xp', '310'], ['dates', '.stat-dates', '120'], ['streak', '.stat-streak', '3']] as const) {
  test(`ketuk penghitung ${item}: lembar menampilkan nilai, kegunaan, dan cara mendapat (teks Shaharil)`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await open(page);
    await page.locator(selector).click();
    await expect(sheet(page)).toHaveAttribute('data-item', item);
    await expect(page.getByRole('dialog')).toContainText(info[item].name.ar);
    await expect(page.getByTestId('item-info-value')).toHaveText(value);
    await expect(page.getByTestId('item-info-use')).toContainText(info[item].use.ar);
    await expect(page.getByTestId('item-info-get')).toContainText(info[item].get.ar);
    await expect(sheet(page).locator('.translation')).toHaveCount(0);        // terjemahan hanya lewat tombol terjemahan
    await page.getByRole('button', { name: CLOSE }).click();
    await expect(sheet(page)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('terjemahan mengikuti tombol terjemahan (id) dan Escape menutup lembar', async ({ page }) => {
  await open(page, '/#/profile', undefined, { translation: true, language: 'id' });
  await page.locator('.stat-dates').click();
  await expect(page.getByTestId('item-info-use').locator('.translation')).toHaveText(info.dates.use.id);
  await expect(page.getByTestId('item-info-get').locator('.translation')).toHaveText(info.dates.get.id);
  await page.keyboard.press('Escape');
  await expect(sheet(page)).toHaveCount(0);
});

test('Profil: tombol info untuk lentera, kata dikuasai, dan tetes bantuan berlabel nama item (HP 375 px)', async ({ page }) => {
  await open(page, '/#/profile', { width: 375, height: 760 });
  for (const item of ['streak', 'mastery', 'hint'] as const) {
    const button = page.getByRole('button', { name: info[item].name.ar, exact: true });
    await expect(button.first()).toBeVisible();
    await button.first().click();
    await expect(sheet(page)).toHaveAttribute('data-item', item);
    const box = await page.getByRole('dialog').boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 376).toBe(true);
    await page.getByRole('button', { name: CLOSE }).click();
  }
});

test('desktop: kartu kata dikuasai di panel kanan punya tombol info', async ({ page }) => {
  await open(page, '/#/');
  await page.locator('.journey-aside .info-button').click();
  await expect(sheet(page)).toHaveAttribute('data-item', 'mastery');
  await expect(page.getByTestId('item-info-value')).toHaveText(/^0 \/ \d+$/);
});

for (const scheme of ['light', 'dark'] as const) test(`lembar penjelasan lolos axe (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, '/#/profile', { width: 375, height: 760 });
  await page.locator('.stat-streak').click();
  await expect(sheet(page)).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: CLOSE }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
