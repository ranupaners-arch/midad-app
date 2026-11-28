import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Kontras warna (WCAG AA) dengan terjemahan MENYALA di layar yang punya tombol/kartu berlatar warna; terang dan gelap, 360 px dan 320 px.
const unit = SHAHARIL_UNITS[0], bank = questions(unit, activities(unit)[0], 'id');
const firstChoice = bank.findIndex(q => q.choices), choice = bank[firstChoice];
const CONTINUE = 'مُتَابَعَة';

async function seed(page: Page, width: number, changes: object = {}) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, language: 'id', dates: 120, xp: 310, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width, height: width === 320 ? 568 : 812 });
}
const contrast = async (page: Page, where: string) => {
  const r = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(r.violations.flatMap(v => v.nodes.map(n => `${where}: ${(n.target as string[]).join(' ')} ${(n.any[0]?.data as { contrastRatio?: number })?.contrastRatio}`)), where).toEqual([]);
};

for (const scheme of ['light', 'dark'] as const) for (const width of [360, 320]) {
  test(`kontras: hub wahdah (tombol utama «mulai/lanjutkan») dengan terjemahan menyala (${scheme}, ${width} px)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await seed(page, width);
    await page.goto('/#/unit/1');
    await expect(page.locator('.unit-start .translation')).toBeVisible();                 // «Mulai belajar»
    await contrast(page, 'hub-mulai');
    await page.evaluate(key => { const p = JSON.parse(localStorage.getItem(key)!); p.completedActivities = ['u1:vocab-1']; localStorage.setItem(key, JSON.stringify(p)); }, STORAGE_KEY);
    await page.reload();
    await expect(page.locator('.unit-start .translation')).toHaveText('Lanjutkan belajar');
    await contrast(page, 'hub-lanjutkan');
  });

  test(`kontras: layar belajar, umpan balik benar dan salah, dan layar lain berwarna dengan terjemahan menyala (${scheme}, ${width} px)`, async ({ page }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ colorScheme: scheme });
    await seed(page, width, { completedActivities: ['u1:vocab-1'] });
    for (const [name, route] of [['jalan', '/#/'], ['kosakata', '/#/unit/1/words'], ['profil', '/#/profile'], ['lemari', '/?demo=1#/wardrobe'], ['ulasan', '/#/review']] as const) { await page.goto(route); await page.waitForTimeout(300); await contrast(page, name); }
    await page.goto('/#/unit/1/lesson/vocab-1');
    await expect(page.locator('.study-card')).toBeVisible(); await contrast(page, 'kartu-belajar');
    for (let i = 0; i < firstChoice; i++) await page.getByRole('button', { name: CONTINUE, exact: true }).click();
    await page.locator(`input[value="${choice.choices!.find(c => c.id !== choice.answer)!.id}"]`).locator('..').click();
    await page.getByTestId('check-answer').click();
    await expect(page.locator('.feedback-panel.wrong')).toBeVisible(); await contrast(page, 'umpan-salah');
    await page.locator('.feedback-panel button').click();
  });
}

for (const scheme of ['light', 'dark'] as const) test(`kontras: umpan balik benar (hijau) dan onboarding dengan terjemahan menyala (${scheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await seed(page, 360, { completedActivities: ['u1:vocab-1'] });
  await page.goto('/#/unit/1/lesson/vocab-1');
  for (let i = 0; i < firstChoice; i++) await page.getByRole('button', { name: CONTINUE, exact: true }).click();
  await page.locator(`input[value="${choice.answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible(); await contrast(page, 'umpan-benar');
  await page.evaluate(key => { const p = JSON.parse(localStorage.getItem(key)!); p.onboarded = false; localStorage.setItem(key, JSON.stringify(p)); }, STORAGE_KEY);
  await page.goto('/#/welcome'); await page.reload();
  await expect(page.locator('.welcome')).toBeVisible(); await contrast(page, 'onboarding-1');
  await page.getByRole('button', { name: CONTINUE, exact: true }).click(); await contrast(page, 'onboarding-2');
  await page.getByRole('button', { name: CONTINUE, exact: true }).click(); await contrast(page, 'onboarding-3');
});
