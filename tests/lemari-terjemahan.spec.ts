import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

const tr = JSON.parse(readFileSync('app/src/domain/wardrobeTr.json', 'utf8')) as Record<string, Record<string, { id: string; en: string }>>;
const SLOT_KEYS = ['color', 'style', 'eyes', 'mouth', 'nose', 'hand', 'head', 'neck', 'skin'];
const ANIMAL_KEYS = ['hudhud', 'cat', 'camel', 'turtle', 'oryx'];

async function open(page: Page, changes: object = {}, viewport = { width: 1280, height: 800 }) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', dates: 120, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto('/?demo=1#/wardrobe');
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
}
const tab = (page: Page, n: number) => page.locator('.customization-tabs button').nth(n).click();

test('terjemahan hidup (ID): kategori, hewan, pratinjau, tombol simpan, dan nama opsi punya terjemahan di bawahnya', async ({ page }) => {
  await open(page, { translation: true, language: 'id' });
  for (const [i, key] of SLOT_KEYS.entries()) await expect(page.locator('.customization-tabs button').nth(i).locator('.translation')).toHaveText(tr.slots[key].id);
  for (const [i, key] of ANIMAL_KEYS.entries()) await expect(page.locator('.animal-picker label').nth(i).locator('.translation')).toHaveText(tr.animals[key].id);
  await expect(page.locator('.wardrobe-stage p .translation')).toHaveText(tr.animals.hudhud.id);
  await expect(page.locator('.wardrobe-save .translation')).toHaveText(tr.ui.save.id);
  await tab(page, 2);                                                                  // mata
  const eyes = ['round', 'happy', 'sleepy', 'star', 'determined', 'wink', 'dot', 'sad', 'up', 'lashes'];
  await expect(page.locator('.customization-option')).toHaveCount(eyes.length);
  for (const [i, key] of eyes.entries()) {
    const option = page.locator('.customization-option').nth(i);
    await expect(option.locator('b')).toBeVisible();
    await expect(option.locator('.translation')).toHaveText(tr.names[key].id);
  }
});

test('bahasa terjemahan Inggris: teks EN; terjemahan mati: tidak ada terjemahan di layar lemari', async ({ page }) => {
  await open(page, { translation: true, language: 'en' });
  await expect(page.locator('.customization-tabs button').first().locator('.translation')).toHaveText(tr.slots.color.en);
  await expect(page.locator('.wardrobe-save .translation')).toHaveText(tr.ui.save.en);
  await page.getByRole('button', { name: 'تَرْجَمَة' }).click();                       // matikan lewat tombol terjemahan
  await expect(page.locator('.wardrobe-screen .translation')).toHaveCount(0);
});

test('tombol simpan: terjemahan mengikuti keadaan (terkunci / kurma kurang / beli / simpan) dan pesan tersimpan', async ({ page }) => {
  await open(page, { translation: true, language: 'id' });
  await page.locator('.animal-picker label').nth(4).click();                            // oryx: terbuka lewat demo, tombol aktif
  await expect(page.locator('.wardrobe-save .translation')).toHaveText(tr.ui.save.id);
  await page.locator('.wardrobe-save .md-btn').click();
  await expect(page.locator('.saved-message .translation')).toHaveText(tr.ui.saved.id);
});

test('?demo=0: tombol terkunci dan terjemahan "Terkunci" muncul di bawah tombol', async ({ page }) => {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id' };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.goto('/?demo=0#/wardrobe');
  await page.locator('.animal-picker label').nth(4).click();
  await expect(page.locator('.wardrobe-save .md-btn')).toBeDisabled();
  await expect(page.locator('.wardrobe-save .translation')).toHaveText(tr.ui.locked.id);
});

for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['HP 375x740', { width: 375, height: 740 }]] as const) {
  test(`dengan terjemahan hidup (${name}): preview tetap terlihat, tombol simpan terlihat, tanpa gulir halaman`, async ({ page }) => {
    await open(page, { translation: true, language: 'id' }, size);
    await tab(page, 2);
    await page.locator('.wardrobe-content').evaluate(el => el.scrollTo(0, 200));
    const stage0 = (await page.locator('.wardrobe-stage').boundingBox())!;
    await page.locator('.wardrobe-content').evaluate(el => el.scrollTo(0, el.scrollHeight));
    const stage1 = (await page.locator('.wardrobe-stage').boundingBox())!, save = (await page.locator('.wardrobe-save .md-btn').boundingBox())!;
    expect(Math.abs(stage1.y - stage0.y)).toBeLessThanOrEqual(1);
    expect(save.y + save.height).toBeLessThanOrEqual(size.height + 1);
    expect(stage1.y + stage1.height).toBeLessThanOrEqual(size.height + 1);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const scheme of ['light', 'dark'] as const) for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['HP', { width: 375, height: 740 }]] as const) test(`lemari dengan terjemahan lolos axe (${name}, ${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, { translation: true, language: 'id' }, size);
  await tab(page, 8);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('HP: opsi yang difokus atau digulirkan ke tampilan tidak tertutup preview yang menempel (terjemahan hidup, layar kecil)', async ({ page }) => {
  for (const size of [{ width: 375, height: 667 }, { width: 320, height: 568 }]) {
    await open(page, { translation: true, language: 'id' }, size);
    await tab(page, 8);
    for (const index of [0, 5, 9]) {
      const option = page.locator('.customization-option').nth(index);
      await option.scrollIntoViewIfNeeded();
      const covered = await option.evaluate(el => { const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !(hit && el.contains(hit)); });
      expect(covered, `${size.width}x${size.height} opsi ${index}`).toBe(false);
    }
    await page.locator('.customization-option input').nth(7).focus();
    const hit = await page.evaluate(() => { const el = document.activeElement!.closest('label')!, r = el.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + 8); return !!top && el.contains(top); });
    expect(hit, `fokus ${size.width}x${size.height}`).toBe(true);
  }
});
