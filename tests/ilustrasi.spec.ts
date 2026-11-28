import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { renderMascot } from '../design-system/assets/maskot/mascot.mjs';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';
import { friendAnimal, sceneFor } from '../app/src/domain/scenes';
import { readFileSync } from 'node:fs';

const CONTINUE = 'مُتَابَعَة';
const unit = SHAHARIL_UNITS[0];
const studyCards = questions(unit, activities(unit)[0], 'id').filter(q => q.kind === 'study');
const aiLabel = JSON.parse(readFileSync('app/src/domain/aiLabel.json', 'utf8')) as { ar: string; id: string; en: string };

async function open(page: Page, mascot: Record<string, unknown> = {}) {
  const p = createProfile();
  const profile = { ...p, onboarded: true, curriculum: 'shaharil', ownedAnimals: ['camel', 'turtle', 'oryx', 'cat'], ownedItems: [...p.ownedItems, 'head:peci', 'hand:lantern', 'neck:scarf'], mascot: { ...p.mascot, ...mascot } };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.study-card')).toBeVisible();
}
// Bandingkan SVG di DOM dengan keluaran renderMascot: id unik berurutan (mm1, mm2, ...) disamakan dan serialisasi diratakan lewat DOM.
const sameSvg = (page: Page, selector: string, expected: string) => page.evaluate(([sel, exp]) => {
  const norm = (s: string) => s.replace(/mm\d+/g, 'mmN');
  const d = document.createElement('div'); d.innerHTML = exp;
  return norm(document.querySelector(sel)!.innerHTML) === norm(d.innerHTML);
}, [selector, expected] as const);
const next = (page: Page) => page.getByRole('button', { name: CONTINUE, exact: true }).click();

test('kartu belajar: kata yang punya adegan menampilkan ilustrasi, kata lain tetap memakai ikon lama', async ({ page }) => {
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (new URL(r.url()).origin !== 'http://127.0.0.1:5173') external.push(r.url()); });
  await open(page);
  let withScene = 0, withoutScene = 0;
  for (let i = 0; i < Math.min(studyCards.length, 12); i++) {
    const def = sceneFor(studyCards[i].word?.audioKey);
    await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', studyCards[i].id);
    if (def) {
      withScene++;
      const scene = page.locator('.study-card .word-scene');
      await expect(scene).toHaveAttribute('data-scene', def.scene);
      await expect(scene).toHaveAttribute('aria-hidden', 'true');
      await expect(scene).toHaveAttribute('data-mode', def.mode);
      await expect(page.locator('.study-card .word-picture')).toHaveCount(0);
      await expect(scene.locator('.ws-bg')).toHaveJSProperty('complete', true);
      expect(await scene.locator('.ws-bg').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await expect(scene.locator('.ws-emoji')).toHaveCount(def.emoji ? 1 : 0);
    } else {
      withoutScene++;
      await expect(page.locator('.study-card .word-scene')).toHaveCount(0);
      await expect(page.locator('.study-card .word-picture')).toBeVisible();
    }
    await expect(page.locator('.study-card .study-word')).toHaveText(studyCards[i].text!.ar);
    await next(page);
  }
  expect(withScene).toBeGreaterThan(0);
  expect(errors).toEqual([]); expect(external).toEqual([]);
  void withoutScene;
});

const CASES = [
  { name: 'unta putih', mascot: { animal: 'camel', color: 'white', style: 'curly', head: 'peci', hand: 'none' }, friend: 'cat' },
  { name: 'kucing', mascot: { animal: 'cat' }, friend: 'hudhud' },
  { name: 'penyu biru', mascot: { animal: 'turtle', color: 'sea', hand: 'lantern', neck: 'scarf' }, friend: 'cat' },
] as const;
for (const c of CASES) test(`ilustrasi mengikuti maskot pilihan pengguna (${c.name}); teman = ${c.friend}`, async ({ page }) => {
  const solo = studyCards.findIndex(q => sceneFor(q.word?.audioKey)?.mode === 'solo');
  const duo = studyCards.findIndex(q => { const d = sceneFor(q.word?.audioKey); return d?.mode === 'duo' && !d.friendFemale; });
  expect(solo).toBeGreaterThanOrEqual(0); expect(duo).toBeGreaterThan(solo);
  await open(page, c.mascot);
  const full = (def: NonNullable<ReturnType<typeof sceneFor>>) => renderMascot({ ...createProfile().mascot, ...c.mascot, ...(def.emote ? { emote: def.emote } : {}) }, { label: '' });
  for (let i = 0; i < solo; i++) await next(page);
  expect(await sameSvg(page, '.study-card [data-role=user]', full(sceneFor(studyCards[solo].word?.audioKey)!))).toBe(true);
  for (let i = solo; i < duo; i++) await next(page);
  expect(await sameSvg(page, '.study-card [data-role=user]', full(sceneFor(studyCards[duo].word?.audioKey)!))).toBe(true);
  expect(friendAnimal(c.mascot.animal)).toBe(c.friend);
  expect(await sameSvg(page, '.study-card [data-role=friend]', renderMascot({ animal: c.friend }, { label: '' }))).toBe(true);
});
test('penanda emoji hanya dekoratif: tidak punya nama aksesibel dan nama kartu tetap dari teks Arab', async ({ page }) => {
  const idx = studyCards.findIndex(q => sceneFor(q.word?.audioKey)?.emoji);
  expect(idx).toBeGreaterThanOrEqual(0);
  await open(page);
  for (let i = 0; i < idx; i++) await next(page);
  const badge = page.locator('.study-card .ws-emoji');
  await expect(badge).toHaveCount(1);
  await expect(badge).toHaveText('');
  await expect(badge.locator('img')).toHaveAttribute('alt', '');
  await expect(page.locator('.study-card .word-scene')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.study-card .study-word')).toHaveText(studyCards[idx].text!.ar);
  // SVG maskot membawa role=img di dalam wadah aria-hidden (tidak dibaca pembaca layar); penanda emoji sendiri tidak boleh punya nama.
  expect(await badge.locator('[role], [aria-label], title').count()).toBe(0);
});

for (const scheme of ['light', 'dark'] as const) test(`kartu belajar dengan ilustrasi lolos pemeriksaan aksesibilitas (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page);
  const idx = studyCards.findIndex(q => sceneFor(q.word?.audioKey)?.emoji);
  for (let i = 0; i < idx; i++) await next(page);
  expect((await new AxeBuilder({ page }).include('.study-card').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
test('gambar adegan gagal dimuat: kartu jatuh ke ikon lama tanpa error', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  // Hanya permintaan gambar (<img>); di dev server, modul ?import&url juga berakhiran .webp tetapi harus lolos.
  await page.route(/\/assets\/vocab\/[^?]*\.webp$/, route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  await open(page);
  await expect(page.locator('.study-card .word-picture')).toBeVisible();
  await expect(page.locator('.study-card .word-scene')).toHaveCount(0);
  await expect(page.locator('.study-card .study-word')).toBeVisible();
  expect(errors).toEqual([]);
});

test('keterangan "Ilustrasi menggunakan AI" tampil di Profil tanpa layar baru', async ({ page }) => {
  const p = createProfile();
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: { ...p, onboarded: true, curriculum: 'shaharil' } });
  await page.goto('/#/profile');
  const note = page.getByTestId('ai-label');
  await expect(note).toBeVisible();
  await expect(note).toContainText(aiLabel.ar);
  await page.locator('details.profile-details', { has: page.locator('.app-version') }).locator('summary').click();   // versi ada di bagian lipat
  await expect(page.locator('.app-version')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
