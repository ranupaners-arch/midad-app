import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

const info = JSON.parse(readFileSync('app/src/domain/itemInfo.json', 'utf8')) as Record<string, Record<'name' | 'use' | 'get', { ar: string; id: string; en: string }>>;
const ORDER = ['xp', 'dates', 'streak', 'hint', 'mastery'];
const CONTINUE = 'مُتَابَعَة';

async function open(page: Page, route: string, viewport: { width: number; height: number }, changes: object = {}) {
  await page.clock.install({ time: new Date('2026-11-28T09:00:00') });
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto(route);
}
const sidebar = (page: Page) => page.locator('.sidebar .companion');
const bubble = (page: Page) => page.getByTestId('companion-bubble');

test('ketuk companion di sidebar: balon bergiliran menjelaskan kegunaan lalu cara mendapat tiap item (teks Shaharil), companion bereaksi', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, '/#/', { width: 1280, height: 800 });
  for (let i = 0; i < ORDER.length * 2 + 1; i++) {
    await sidebar(page).click();
    const item = ORDER[(i >> 1) % ORDER.length], part = i % 2 ? 'get' : 'use';
    await expect(bubble(page)).toHaveAttribute('data-item', item);
    await expect(bubble(page)).toHaveAttribute('data-part', part);
    await expect(bubble(page)).toContainText(info[item][part].ar);
    await expect(sidebar(page)).not.toHaveAttribute('data-emote', 'none');
    await page.clock.fastForward(1900);                              // reaksi selesai, balon tetap
    await expect(sidebar(page)).toHaveAttribute('data-emote', 'none');
    await expect(bubble(page)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('balon: hilang otomatis (9 dtk), ketuk menutup, Escape menutup, tidak keluar dari sidebar', async ({ page }) => {
  await open(page, '/#/', { width: 1280, height: 800 });
  await sidebar(page).click();
  const b = await bubble(page).boundingBox(), s = await page.locator('.sidebar').boundingBox();
  expect(b && s && b.x >= s.x - 1 && b.x + b.width <= s.x + s.width + 1).toBe(true);
  await page.clock.fastForward(8500); await expect(bubble(page)).toBeVisible();
  await page.clock.fastForward(1000); await expect(bubble(page)).toHaveCount(0);
  await sidebar(page).click(); await bubble(page).click(); await expect(bubble(page)).toHaveCount(0);
  await sidebar(page).click(); await page.keyboard.press('Escape'); await expect(bubble(page)).toHaveCount(0);
});

for (const scheme of ['light', 'dark'] as const) test(`balon dapat diakses (${scheme}): tombol dengan nama dari teks, wilayah aria-live, fokus keyboard (Enter), axe`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, '/#/', { width: 1280, height: 800 });
  await expect(page.locator('.companion-status')).toHaveAttribute('aria-live', 'polite');
  await sidebar(page).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: info.xp.use.ar })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
test('layar soal/ujian: ketuk companion hanya bereaksi, tanpa balon', async ({ page }) => {
  const unit = SHAHARIL_UNITS[0], bank = questions(unit, activities(unit)[0], 'id'), first = bank.findIndex(q => q.choices);
  await open(page, '/#/unit/1/lesson/vocab-1', { width: 1280, height: 800 });
  for (let i = 0; i < first; i++) await page.getByRole('button', { name: CONTINUE, exact: true }).click();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', bank[first].id);
  await sidebar(page).click();
  await expect(sidebar(page)).not.toHaveAttribute('data-emote', 'none');
  await expect(bubble(page)).toHaveCount(0);
  await expect(page.locator('.companion-status')).toHaveCount(0);
});

test('Profil (HP 375 px): ketuk companion di kartu Profil memunculkan balon di dalam layar, terjemahan mengikuti tombol terjemahan', async ({ page }) => {
  await open(page, '/#/profile', { width: 375, height: 760 }, { translation: true, language: 'en' });
  await page.locator('.profile-companion').click();
  await expect(bubble(page)).toBeVisible();
  await expect(bubble(page).locator('.translation')).toHaveText(info.xp.use.en);
  const b = await bubble(page).boundingBox();
  expect(b && b.x >= 0 && b.x + b.width <= 376).toBe(true);
  await bubble(page).click(); await expect(bubble(page)).toHaveCount(0);
});

test('tanpa timer bocor: pindah layar saat balon terbuka tidak menimbulkan error dan balon hilang', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, '/#/', { width: 1280, height: 800 });
  await sidebar(page).click();
  await expect(bubble(page)).toBeVisible();
  await page.locator('a.nav-item[href="#/wardrobe"]').click();
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
  await page.clock.fastForward(20000);
  await expect(bubble(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});
