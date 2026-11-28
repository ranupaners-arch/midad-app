import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

type L = { ar: string; id: string; en: string };
const oman = JSON.parse(readFileSync('app/src/domain/omanTexts.json', 'utf8')) as { banner: L; previewNote: L; label: Record<'region' | 'vehicle' | 'vocab', L>; vocab: (L & { note: L })[]; btn: Record<'replay' | 'back', L> };

// Halaman demo Oman: PRATINJAU stateless (tanpa XP/kurma/level 17/oryx/dishdasha, tanpa menulis localStorage). Teks Arab dari Shaharil (omanTexts.json).
const profile = (changes: object = {}) => ({ ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id', xp: 45, dates: 7, ...changes });
async function open(page: Page, size = { width: 375, height: 740 }, changes: object = {}) {
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile(changes) });
  await page.setViewportSize(size);
  await page.goto('/#/demo/oman');
  await expect(page.getByTestId('demo-oman')).toBeVisible();
}
const stored = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, JSON.parse(localStorage.getItem(k)!)])));

test('halaman demo: ditandai "Demo" dan keterangan pratinjau jujur tampil jelas (Arab Shaharil + terjemahan)', async ({ page }) => {
  await open(page);
  await expect(page.locator('.oman-demo-badge')).toHaveText('Demo');
  await expect(page.getByTestId('demo-oman-note')).toContainText(oman.previewNote.ar);
  await expect(page.getByTestId('demo-oman-note').locator('.translation')).toHaveText(oman.previewNote.id);   // terjemahan keterangan pratinjau selalu tampil
  await expect(page.locator('h1')).toHaveText('عُمَانُ');
});

test('animasi: kapal baghlah berlayar ke Muscat, spanduk kedatangan Shaharil, tanpa nomor level', async ({ page }) => {
  await open(page);
  const anim = page.getByTestId('level-up');
  await expect(anim).toBeVisible();
  await expect(anim).toHaveAttribute('data-port', 'Muscat');
  await expect(anim).not.toHaveAttribute('data-level', /.*/);                                      // tidak menyiratkan level 17
  await expect(anim.locator('.lv-star')).toHaveCount(1); await expect(anim.locator('.lv-dot + text, .lv-to text')).toHaveCount(0);
  await expect(anim.locator('.lv-banner b')).toHaveText(oman.banner.ar);                             // «وَصَلْتَ إِلَى مَسْقَطَ!»
  await expect(anim.locator('.lv-banner .translation')).toHaveText(oman.banner.id);
  await expect(anim.locator('.vh-boat, svg [class*=vh-]').first()).toBeAttached();                 // kendaraan digambar (baghlah)
});

test('reduced-motion: kapal langsung di pelabuhan tanpa animasi; gerak biasa: animateMotion berjalan sampai selesai', async ({ page, browser }) => {
  await open(page);                                                                                 // konfigurasi tes: reduced-motion
  await expect(page.getByTestId('level-up')).toHaveClass(/lv-static/);
  await expect(page.locator('animateMotion')).toHaveCount(0);
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' }), motion = await ctx.newPage();
  await motion.addInitScript(({ key, value }) => { localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile() });
  await motion.setViewportSize({ width: 375, height: 740 }); await motion.goto('/#/demo/oman');
  await expect(motion.locator('animateMotion')).toHaveCount(1);
  await expect(motion.getByTestId('level-up')).not.toHaveClass(/lv-static/);
  await motion.waitForFunction(() => (document.querySelector('.md-lvl__map') as unknown as SVGSVGElement).getCurrentTime() >= 3.5, undefined, { timeout: 15000 });
  await ctx.close();
});

test('kartu Oman: nama wilayah, kapal baghlah, label, 3 kosakata budaya (+ keterangan) persis dari Shaharil dan data app', async ({ page }) => {
  await open(page);
  const card = page.getByTestId('oman-card');
  await expect(card).toContainText('عُمَانُ'); await expect(card).toContainText('بَغْلَة');
  for (const key of ['region', 'vehicle', 'vocab'] as const) await expect(card).toContainText(oman.label[key].ar);
  await expect(card.locator('.oman-vehicle svg.vh').first()).toBeVisible();
  const words = page.getByTestId('oman-vocab'); await expect(words).toHaveCount(3);
  for (const [i, v] of oman.vocab.entries()) {
    await expect(words.nth(i).locator('.oman-word')).toHaveText(v.ar);
    await expect(words.nth(i)).toContainText(v.id); await expect(words.nth(i)).toContainText(v.note.id);   // terjemahan hidup (ID)
    expect(v.note.ar).toBe('');                                                                              // keterangan hanya id/en, tanpa baris Arab
  }
});

test('terjemahan mati: terjemahan dan keterangan kata disembunyikan, keterangan pratinjau tetap tampil', async ({ page }) => {
  await open(page, undefined, { translation: false });
  await expect(page.getByTestId('oman-vocab').first().locator('.translation')).toHaveCount(0);
  await expect(page.getByTestId('demo-oman-note').locator('.translation')).toHaveText(oman.previewNote.id);
});

test('Ulangi memutar ulang animasi; Kembali ke layar Perjalanan', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('oman-replay')).toContainText(oman.btn.replay.ar);
  const before = await page.locator('.md-lvl__map').evaluate(el => (el as unknown as SVGSVGElement).getCurrentTime());
  await page.waitForTimeout(500);
  await page.getByTestId('oman-replay').click();
  await expect(page.getByTestId('level-up')).toBeVisible();
  const after = await page.locator('.md-lvl__map').evaluate(el => (el as unknown as SVGSVGElement).getCurrentTime());
  expect(after).toBeLessThan(before + 0.5);                                                             // elemen baru: jam animasi mulai dari awal
  await page.getByTestId('oman-back').click();
  await expect(page).toHaveURL(/#\/$/);
});

test('stateless: tidak ada penulisan progres (XP, kurma, level, hewan, skin, sesi) dan tidak ada "17" di halaman', async ({ page }) => {
  await open(page, undefined, { xp: 45, dates: 7, rewardedUnits: [1] });
  const before = await stored(page);
  await page.getByTestId('oman-replay').click(); await page.getByTestId('oman-replay').click();
  await page.reload(); await expect(page.getByTestId('demo-oman')).toBeVisible();
  const after = await stored(page);
  const p0 = before[STORAGE_KEY] as Record<string, unknown>, p1 = after[STORAGE_KEY] as Record<string, unknown>;
  for (const key of ['xp', 'dates', 'rewardedUnits', 'completedActivities', 'ownedAnimals', 'ownedSkins', 'ownedItems', 'mastery', 'bestScores', 'session', 'mascot', 'activityDays', 'reviews']) expect(p1[key], key).toEqual(p0[key]);
  expect(Object.keys(after)).toEqual(Object.keys(before));
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/17|١٧/);
  expect(text).not.toMatch(/oryx|dishdasha|دِشْدَاشَةٌ|مَهَا/i);
});

test('tidak ada tautan ke halaman demo di navigasi (hanya lewat URL)', async ({ page }) => {
  await open(page);
  await page.goto('/#/');
  await expect(page.locator('a[href="#/demo/oman"]')).toHaveCount(0);
});

for (const size of [{ width: 375, height: 740 }, { width: 320, height: 568 }]) test(`tata letak HP ${size.width} px: tanpa gulir horizontal, tombol terjangkau`, async ({ page }) => {
  await open(page, size);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByTestId('oman-back').scrollIntoViewIfNeeded();
  const b = (await page.getByTestId('oman-back').boundingBox())!;
  expect(b.height).toBeGreaterThanOrEqual(44); expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(size.width + 1);
  await page.evaluate(() => scrollTo(0, 0));
  const banner = (await page.locator('.lv-banner').boundingBox())!, nav = (await page.locator('.mobile-nav').boundingBox())!;      // spanduk kedatangan terlihat tanpa gulir
  expect(banner.y + banner.height).toBeLessThanOrEqual(nav.y);
});

for (const scheme of ['light', 'dark'] as const) test(`halaman demo Oman lolos axe (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
