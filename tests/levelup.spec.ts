import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { activities, questions, UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';
import type { Question } from '../app/src/domain/types';

async function seed(page: Page, changes = {}) {
  const profile = { ...createProfile(), onboarded: true, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
}
async function answerCorrect(page: Page, q: Question) {
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', q.id);
  if (q.kind === 'order') for (const word of q.words!) await page.locator('.word-bank').getByRole('button', { name: word, exact: true }).click();
  else if (q.kind === 'speak') { await page.locator('.speech-controls .md-btn').click(); await page.locator('.feedback-panel button').click(); return; }
  else await page.locator(`input[type="radio"][value="${q.choices!.find(c => c.id === q.answer)!.id}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await page.locator('.feedback-panel button').click();
}
async function passUnitOneQuiz(page: Page, changes = {}) {
  const unit = UNITS[0];
  await seed(page, { completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])), ...changes });
  await page.goto('/#/unit/1/lesson/quiz');
  for (const q of questions(unit, activities(unit).find(a => a.kind === 'quiz')!, 'id')) await answerCorrect(page, q);
  await expect(page.locator('.score-display')).toContainText('100');
}

test('reduced motion: kendaraan langsung di pelabuhan baru, spanduk tampil, komponen tanpa pelanggaran aksesibilitas', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await passUnitOneQuiz(page);
  const lv = page.getByTestId('level-up');
  await expect(lv).toBeVisible();
  await expect(lv).toHaveAttribute('data-level', '2');
  await expect(lv.locator('.lv-banner')).toContainText('Banten');
  await expect(lv.locator('animateMotion')).toHaveCount(0);
  await expect(lv.locator('.lv-rider')).toHaveAttribute('transform', 'translate(320 140)');
  expect((await new AxeBuilder({ page }).include('[data-testid=level-up]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('ulangan kuis yang sudah berhadiah tidak memutar animasi naik level lagi', async ({ page }) => {
  test.setTimeout(120000);
  await passUnitOneQuiz(page, { rewardedUnits: [1] });
  await expect(page.getByTestId('level-up')).toHaveCount(0);
  await expect(page.locator('.travel-celebration')).toBeVisible();
});

test.describe('dengan gerak aktif', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('kendaraan berlayar mengikuti jalur ±3,4 dtk lalu spanduk muncul', async ({ page }) => {
    test.setTimeout(120000);
    await passUnitOneQuiz(page);
    const lv = page.getByTestId('level-up');
    await expect(lv).toBeVisible();
    await expect(lv.locator('animateMotion')).toHaveAttribute('dur', '3.4s');
    await expect(lv.locator('animateMotion mpath')).toHaveCount(1);
    await expect(lv).toHaveClass(/^(?!.*lv-static)/);
    await expect.poll(() => lv.locator('.lv-banner').evaluate(el => Number(getComputedStyle(el).opacity)), { timeout: 8000 }).toBe(1);
  });
});

