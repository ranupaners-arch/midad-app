import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

const CONTINUE = 'مُتَابَعَة';
async function seed(page: Page, width: number, changes: object = {}) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id', dates: 120, xp: 310, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width, height: width === 320 ? 568 : 812 });
}
// Jarak horizontal antara teks Arab (saudara sebelumnya) dan terjemahan sebaris di dalam elemen yang sama.
const gap = (page: Page, selector: string) => page.locator(selector).first().evaluate(el => {
  const t = el.querySelector('.translation')!, prev = t.previousSibling!;
  const range = document.createRange(); range.selectNodeContents(prev);
  const a = range.getBoundingClientRect(), b = t.getBoundingClientRect();
  return { gap: Math.max(b.left - a.right, a.left - b.right), sameLine: a.top < b.bottom && b.top < a.bottom };
});

for (const width of [360, 320]) test(`jarak teks Arab dan terjemahan sebaris pada ringkasan hub wahdah (${width} px)`, async ({ page }) => {
  await seed(page, width, { completedActivities: ['u1:vocab-1'] });
  await page.goto('/#/unit/1');
  for (const selector of ['.unit-note:not(.language-note) > summary', '.language-note > summary']) {
    await expect(page.locator(selector).first().locator('.translation')).toBeVisible();
    const g = await gap(page, selector);
    if (g.sameLine) expect(g.gap, selector).toBeGreaterThanOrEqual(6);
  }
});

test('tes tahdid: tombol «رجوع» dan «Kembali ke pilihan awal» tidak menempel', async ({ page }) => {
  await seed(page, 360, { onboarded: false });
  await page.goto('/#/welcome');
  await page.getByRole('button', { name: CONTINUE, exact: true }).click();
  await page.getByRole('button', { name: CONTINUE, exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'Ikut tes tahdid mustawa' }).click();
  const button = page.locator('.welcome-placement > .text-button');
  await expect(button.locator('.translation')).toBeVisible();
  const g = await gap(page, '.welcome-placement > .text-button');
  if (g.sameLine) expect(g.gap).toBeGreaterThanOrEqual(6);
});

for (const width of [360, 320]) test(`tab kategori Rafiqi: bisa digeser dan setiap tab terbaca penuh pada posisi gulir tertentu (${width} px)`, async ({ page }) => {
  await seed(page, width);
  await page.goto('/?demo=1#/wardrobe');
  await expect(page.locator('.customization-tabs')).toBeVisible();
  const info = await page.locator('.customization-tabs').evaluate(el => ({ scrollable: el.scrollWidth > el.clientWidth, mask: getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage, snap: getComputedStyle(el).scrollSnapType }));
  expect(info.scrollable).toBe(true);                                       // tidak mungkin muat semua tab; harus bisa digeser
  expect(info.mask).not.toBe('none');                                       // tepi memudar = petunjuk masih ada tab lain
  expect(info.snap).toContain('x');
  const tabs = page.locator('.customization-tabs button'), count = await tabs.count();
  expect(count).toBe(9);
  for (let i = 0; i < count; i++) {
    await tabs.nth(i).evaluate(el => el.scrollIntoView({ inline: 'center', block: 'nearest' }));
    const clipped = await tabs.nth(i).evaluate(el => { const r = el.getBoundingClientRect(), c = el.parentElement!.getBoundingClientRect(); return r.left < c.left + 19 || r.right > c.right - 19; });
    expect(clipped, `tab ${i} terpotong/memudar pada posisi terbaik`).toBe(false);
  }
  await tabs.last().click();                                                // tab terakhir (Pakaian) bisa dipilih lewat geser
  await expect(tabs.last()).toHaveAttribute('aria-pressed', 'true');
});

for (const scheme of ['light', 'dark'] as const) test(`lemari dan hub dengan perbaikan kecil lolos axe (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await seed(page, 360, { completedActivities: ['u1:vocab-1'] });
  await page.goto('/?demo=1#/wardrobe');
  await expect(page.locator('.customization-tabs')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.goto('/#/unit/1');
  await expect(page.locator('.unit-start')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
