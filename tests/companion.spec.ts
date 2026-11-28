import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

const CONTINUE = 'مُتَابَعَة';
const unit = SHAHARIL_UNITS[0];
const bank = questions(unit, activities(unit)[0], 'id');
const firstQuestion = bank.findIndex(q => q.kind === 'choice' || q.choices);
const question = bank[firstQuestion];

// Jam palsu: reaksi dan timer idle dikendalikan lewat page.clock; animasi CSS tetap jalan di jam asli.
async function open(page: Page, viewport = { width: 375, height: 760 }, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion });
  await page.clock.install({ time: new Date('2026-11-28T09:00:00') });
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil' };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(viewport);
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.study-card')).toBeVisible();
  for (let i = 0; i < firstQuestion; i++) await page.getByRole('button', { name: CONTINUE, exact: true }).click();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', question.id);
}
const hp = (page: Page) => page.locator('.lesson-companion');
const desk = (page: Page) => page.locator('.sidebar .companion');
const choose = (page: Page, id: string) => page.locator(`input[value="${id}"]`).locator('..').click();
const check = (page: Page) => page.getByTestId('check-answer').click();
const wrongId = () => question.choices!.find(c => c.id !== question.answer)!.id;

test('jawaban BENAR: companion ceria (cheer + lompat) lalu kembali normal', async ({ page }) => {
  await open(page);
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await choose(page, question.answer!); await check(page);
  await expect(hp(page)).toHaveAttribute('data-emote', 'cheer');
  await expect(hp(page)).toHaveAttribute('data-motion', 'hop');
  await page.clock.fastForward(1900);
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
});

test('jawaban SALAH: kaget lembut (surprised + goyang), tidak menghukum, lalu kembali normal', async ({ page }) => {
  await open(page);
  await choose(page, wrongId()); await check(page);
  await expect(hp(page)).toHaveAttribute('data-emote', 'surprised');
  await expect(hp(page)).toHaveAttribute('data-motion', 'sway');
  await page.clock.fastForward(1900);
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
});

test('IDLE: 15 dtk berpikir (kepala miring), 45 dtk tidur, interaksi membangunkan dan mereset timer', async ({ page }) => {
  await open(page);
  await page.clock.fastForward(14000);
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await page.clock.fastForward(1500);
  await expect(hp(page)).toHaveAttribute('data-emote', 'think');
  await expect(hp(page)).toHaveAttribute('data-motion', 'tilt');
  await page.clock.fastForward(30000);
  await expect(hp(page)).toHaveAttribute('data-emote', 'sleep');
  await page.mouse.click(5, 400);                                   // interaksi di luar pilihan jawaban
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await page.clock.fastForward(14000);                              // timer di-reset: belum berpikir lagi
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await page.clock.fastForward(1500);
  await expect(hp(page)).toHaveAttribute('data-emote', 'think');
});

test('pindah soal mereset timer idle; soal yang sudah dijawab tidak memicu idle', async ({ page }) => {
  await open(page);
  await page.clock.fastForward(10000);
  await choose(page, question.answer!); await check(page);
  await page.clock.fastForward(1900);
  await page.clock.fastForward(60000);                              // feedback terbuka: tidak berpikir/tidur
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await page.locator('.feedback-panel button').click();
  await expect(page.locator('.question-body')).not.toHaveAttribute('data-question-id', question.id);
  await page.clock.fastForward(14000);
  await expect(hp(page)).toHaveAttribute('data-emote', 'none');
  await page.clock.fastForward(1500);
  await expect(hp(page)).toHaveAttribute('data-emote', 'think');
});

test('tidak ada timer bocor: meninggalkan pelajaran membangunkan companion dan idle tidak muncul di layar lain', async ({ page }) => {
  await open(page, { width: 1280, height: 800 });
  await page.clock.fastForward(46000);
  await expect(desk(page)).toHaveAttribute('data-emote', 'sleep');
  await page.locator('a.icon-button[href="#/unit/1"]').click();
  await expect(page.locator('.lesson-screen')).toHaveCount(0);
  await expect(desk(page)).toHaveAttribute('data-emote', 'none');
  await page.clock.fastForward(120000);
  await expect(desk(page)).toHaveAttribute('data-emote', 'none');
});

test('desktop: companion sidebar ikut bereaksi saat menjawab; versi HP disembunyikan', async ({ page }) => {
  await open(page, { width: 1280, height: 800 });
  await expect(hp(page)).toBeHidden();
  await choose(page, question.answer!); await check(page);
  await expect(desk(page)).toHaveAttribute('data-emote', 'cheer');
});

test('gerak memenuhi prefers-reduced-motion: gerak hanya bila tidak diminta mengurangi, ekspresi tetap berganti', async ({ browser }) => {
  for (const [mode, expected] of [['no-preference', 'cmp-hop'], ['reduce', 'none']] as const) {
    const page = await (await browser.newContext()).newPage();
    await open(page, { width: 375, height: 760 }, mode);
    await choose(page, question.answer!); await check(page);
    await expect(hp(page)).toHaveAttribute('data-emote', 'cheer');
    expect(await hp(page).locator('.mascot').evaluate(el => getComputedStyle(el).animationName)).toBe(expected);
    await page.close();
  }
});

test('ketuk companion: di sidebar bereaksi bergilir lalu kembali normal; di layar belajar (HP) juga bereaksi tanpa membuka apa pun', async ({ page }) => {
  await open(page, { width: 1280, height: 800 });
  await desk(page).click();
  await expect(desk(page)).not.toHaveAttribute('data-emote', 'none');
  const first = await desk(page).getAttribute('data-emote');
  await page.clock.fastForward(1900);
  await expect(desk(page)).toHaveAttribute('data-emote', 'none');
  await desk(page).click();
  expect(await desk(page).getAttribute('data-emote')).not.toBe(first);
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', question.id);

  await page.setViewportSize({ width: 375, height: 760 });
  await hp(page).click();
  await expect(hp(page)).not.toHaveAttribute('data-emote', 'none');
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', question.id);
});

test('layar belajar HP: companion tidak menutupi jawaban, tidak masuk urutan fokus/pembaca layar, axe bersih', async ({ page }) => {
  await open(page);
  const box = await hp(page).boundingBox(), content = await page.locator('.question-content').boundingBox();
  expect(box && content && box.y + box.height <= content.y + 1).toBe(true);
  await expect(hp(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(hp(page)).toHaveAttribute('tabindex', '-1');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('sidebar desktop: tombol companion berlabel dan dapat difokus dengan keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil' };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.goto('/#/');
  const button = page.getByRole('button', { name: 'رَفِيقُكَ فِي الرِّحْلَةِ' });
  await expect(button).toBeVisible();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).not.toHaveAttribute('data-emote', 'none');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
