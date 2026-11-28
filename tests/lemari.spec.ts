import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Lemari/Rafiqi: preview companion besar dan terkunci; hanya daftar opsi yang bergulir. ?demo=1 membuka semua opsi (daftar panjang untuk digulir).
async function open(page: Page, viewport: { width: number; height: number }, demo: '0' | '1' = '1') {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', dates: 120 };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto(`/?demo=${demo}#/wardrobe`);
  await expect(page.locator('.wardrobe-stage')).toBeVisible();
}
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!;
const tab = (page: Page, n: number) => page.locator('.customization-tabs button').nth(n).click();
const scrollOptions = (page: Page, to: 'end' | number) => page.locator('.wardrobe-content').evaluate((el, target) => { el.scrollTo(0, target === 'end' ? el.scrollHeight : (target as number)); }, to);
const insideViewport = (b: { x: number; y: number; width: number; height: number }, v: { width: number; height: number }) => b.x >= -1 && b.y >= -1 && b.x + b.width <= v.width + 1 && b.y + b.height <= v.height + 1;

const SIZES = { desktop: { width: 1280, height: 800 }, hp740: { width: 375, height: 740 }, hp667: { width: 375, height: 667 } };

test('desktop 1280x800: dua kolom, preview besar di kiri FISIK, opsi di kanan; preview tidak ikut bergulir', async ({ page }) => {
  await open(page, SIZES.desktop);
  const stage = await box(page, '.wardrobe-stage'), options = await box(page, '.animal-picker'), mascot = await box(page, '.wardrobe-stage .mascot svg');
  expect(stage.width).toBeGreaterThanOrEqual(300);
  expect(mascot.height).toBeGreaterThanOrEqual(250); expect(mascot.height).toBeLessThanOrEqual(400);
  expect(stage.x + stage.width).toBeLessThanOrEqual(options.x + 1);            // preview di kiri fisik, opsi di kanannya
  await tab(page, 2);                                                           // mata: daftar panjang
  const scrollable = await page.locator('.wardrobe-content').evaluate(el => el.scrollHeight - el.clientHeight);
  expect(scrollable).toBeGreaterThan(100);
  await scrollOptions(page, 'end');
  const after = await box(page, '.wardrobe-stage');
  expect(Math.abs(after.y - stage.y)).toBeLessThanOrEqual(1);                   // preview tidak bergerak
  expect(insideViewport(after, SIZES.desktop)).toBe(true);
  expect(insideViewport(await box(page, '.wardrobe-save .md-btn'), SIZES.desktop)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);   // halaman tidak ikut bergulir
});

for (const [name, size] of [['HP 375x740', SIZES.hp740], ['HP 375x667', SIZES.hp667]] as const) {
  test(`${name}: preview besar menempel di atas (24-40% tinggi layar), opsi bergulir di bawahnya, tombol simpan tetap terlihat`, async ({ page }) => {
    await open(page, size);
    const stage = await box(page, '.wardrobe-stage'), mascot = await box(page, '.wardrobe-stage .mascot svg');
    expect(stage.height).toBeGreaterThanOrEqual(size.height * 0.24); expect(stage.height).toBeLessThanOrEqual(size.height * 0.4);
    expect(mascot.height).toBeGreaterThanOrEqual(size.height * 0.2);
    expect(stage.y).toBeLessThan(size.height * 0.3);
    expect((await box(page, '.wardrobe-content')).height - stage.height).toBeGreaterThanOrEqual(150);   // daftar opsi (di bawah preview) tetap lega
    await tab(page, 2);
    await scrollOptions(page, 'end');
    const after = await box(page, '.wardrobe-stage');
    expect(Math.abs(after.y - stage.y)).toBeLessThanOrEqual(1);
    expect(insideViewport(after, size)).toBe(true);
    expect(insideViewport(await box(page, '.wardrobe-save .md-btn'), size)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  });
}

test('mengganti hewan, warna, mata, dan skin langsung mengubah preview besar; tata letak tidak melompat', async ({ page }) => {
  await open(page, SIZES.hp740);
  const svg = () => page.locator('.wardrobe-stage .mascot svg').innerHTML();
  const name = () => page.locator('.wardrobe-stage p').innerText();
  const y0 = (await box(page, '.wardrobe-stage')).y, seen = new Set([await svg()]), names = new Set([await name()]);
  await page.locator('.animal-picker label').nth(2).click(); seen.add(await svg()); names.add(await name());     // unta
  await tab(page, 0); await page.locator('.customization-option').nth(3).click(); seen.add(await svg());          // warna
  await tab(page, 2); await scrollOptions(page, 'end'); await page.locator('.customization-option').last().click(); seen.add(await svg());   // mata
  await tab(page, 8); await page.locator('.customization-option').nth(8).click(); seen.add(await svg());          // skin emas
  expect(seen.size).toBe(5); expect(names.size).toBe(2);
  expect(Math.abs((await box(page, '.wardrobe-stage')).y - y0)).toBeLessThanOrEqual(1);
});

test('perubahan lewat keyboard di daftar opsi tidak menggeser atau menutup preview', async ({ page }) => {
  await open(page, SIZES.hp740);
  await tab(page, 2); await scrollOptions(page, 'end');
  const y0 = (await box(page, '.wardrobe-stage')).y;
  await page.locator('.customization-option input').last().focus();
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  const after = await box(page, '.wardrobe-stage');
  expect(Math.abs(after.y - y0)).toBeLessThanOrEqual(1); expect(insideViewport(after, SIZES.hp740)).toBe(true);
});

test('urutan DOM/fokus: preview (tidak fokus) lalu opsi, lalu tombol simpan di footer (memilih dahulu, menyimpan terakhir)', async ({ page }) => {
  await open(page, SIZES.desktop);
  const order = await page.evaluate(() => {
    const q = (s: string) => document.querySelector(s)!;
    const before = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return [before(q('.wardrobe-stage'), q('.animal-picker')), before(q('.customization-options'), q('.wardrobe-save'))];
  });
  expect(order).toEqual([true, true]);
  await page.locator('.animal-picker label input').first().focus();
  for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(() => !!document.activeElement?.closest('.wardrobe-save'))) break; }
  expect(await page.evaluate(() => !!document.activeElement?.closest('.wardrobe-save'))).toBe(true);   // Tab sampai ke tombol simpan
});
test('aturan lama tetap: mode demo mati (?demo=0) menguncinya lagi; mode demo menyala membuka dan menandai "Demo"', async ({ page }) => {
  await open(page, SIZES.desktop, '0');
  await page.locator('.animal-picker label').nth(4).click();
  await expect(page.locator('.wardrobe-save .md-btn')).toBeDisabled();
  await expect(page.locator('.demo-badge')).toHaveCount(0);
  await page.goto('/?demo=1#/wardrobe');
  await page.reload();
  await page.locator('.animal-picker label').nth(4).click();
  await expect(page.locator('.wardrobe-save .md-btn')).toBeEnabled();
  await expect(page.locator('.animal-picker .demo-badge')).toHaveCount(4);
});

for (const scheme of ['light', 'dark'] as const) for (const [name, size] of Object.entries(SIZES)) test(`lemari ${name} lolos axe (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, size);
  await tab(page, 8);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
