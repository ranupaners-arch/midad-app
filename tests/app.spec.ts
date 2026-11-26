import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { activities, questions, SHAHARIL_UNITS, UNITS } from '../app/src/domain/content';
import { placementQuestions } from '../app/src/domain/placement';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';
import type { Question } from '../app/src/domain/types';
import { recordLearningAnswer } from '../app/src/domain/reviews';

async function seed(page: Page, changes = {}) {
  const profile = { ...createProfile(), onboarded: true, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
}
async function answer(page: Page, q: Question, wrong = false) {
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', q.id);
  if (q.kind === 'study') { await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click(); return; }
  if (q.kind === 'order') for (const word of q.words!) await page.locator('.word-bank button:enabled').and(page.getByRole('button', { name: word, exact: true })).first().click();
  else if (q.kind === 'speak') { await page.locator('.speech-skip').click(); await page.locator('.feedback-panel button').click(); return; }
  else { const choice = wrong ? q.choices!.find(c => c.id !== q.answer)! : q.choices!.find(c => c.id === q.answer)!; await page.locator(`input[type="radio"][value="${choice.id}"]`).locator('..').click(); }
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel')).toBeVisible();
  await page.locator('.feedback-panel button').click();
}

function vocabularyCheckpoint(cursor: number, graded: boolean[] = []) {
  const bank = questions(UNITS[0], activities(UNITS[0])[0], 'id');
  return { unitId: 1, activityId: 'vocab-1', questionVersion: 2 as const, cursor, answers: bank.slice(0, cursor).map((q, index) => ({ questionId: q.id, correct: index < 10 || (graded[index - 10] ?? true), skipped: false, hinted: false, wordId: q.word!.idKey })), hintAt: null };
}

test('mobile demo journey from onboarding to all three units and rewards', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  await page.getByRole('radio', { name: 'فَيْرُوزِيٌّ', exact: true }).locator('..').click();
  await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  await page.getByRole('button', { name: 'اِبْدَأْ', exact: true }).click();
  await expect(page.locator('.journey-screen')).toBeVisible();
  await page.locator('a.unit-link[href="#/unit/1"]').click();
  const unit = SHAHARIL_UNITS[0];
  await expect(page.getByText(/Akhiran ـكَ dan ـكِ mengikuti|mengikuti lawan bicara/)).toBeVisible();
  for (const activity of activities(unit)) {
    await page.locator(`a.activity-card[href="#/unit/1/lesson/${activity.id}"]`).click();
    await expect(page.locator('.question-body')).toBeVisible();
    if (activity.id === 'vocab-1' || activity.id === 'pattern') expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    if (activity.id === 'vocab-1') await page.getByRole('button', { name: 'تَرْجَمَة', exact: true }).click();
    for (const q of questions(unit, activity, 'id')) {
      if (q.speaker) await expect(page.locator('.dialogue-speaker')).toHaveText(q.speaker);
      if (q.meaningTest || activity.kind === 'quiz') {
        await expect(page.getByRole('button', { name: 'التَّرْجَمَةُ مُقْفَلَةٌ فِي هَذَا السُّؤَالِ', exact: true })).toBeDisabled();
        await expect(page.locator('.question-cue .translation')).toHaveCount(0);
      }
      await answer(page, q);
    }
    await expect(page.locator('.result-screen')).toBeVisible();
    await page.locator('.result-actions a[href="#/unit/1"]').click();
  }
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).rewardedUnits, STORAGE_KEY)).toEqual([1]);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.dates).toBe(50); expect(saved.mascot.color).toBe('teal');
  await page.reload();
  await page.locator('a.activity-card[href="#/unit/1/lesson/quiz"]').click();
  for (const q of questions(unit, activities(unit).find(a => a.kind === 'quiz')!, 'id')) await answer(page, q);
  await expect(page.locator('.result-screen')).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(50);
  await page.locator('.result-actions a[href="#/unit/2"]').click();
  for (const nextUnit of SHAHARIL_UNITS.slice(1)) {
    for (const activity of activities(nextUnit)) {
      await page.locator(`a.activity-card[href="#/unit/${nextUnit.id}/lesson/${activity.id}"]`).click();
      for (const q of questions(nextUnit, activity, 'id')) await answer(page, q);
      await expect(page.locator('.result-screen')).toBeVisible();
      const destination = activity.kind !== 'quiz' ? `/unit/${nextUnit.id}` : nextUnit.id === 2 ? '/unit/3' : '/summary';
      await page.locator(`.result-actions a[href="#${destination}"]`).click();
    }
  }

  await expect(page.locator('.summary-stats')).toContainText('93/93');
  await expect(page.locator('.summary-gift')).toBeVisible();
  await expect(page.locator('.summary-units li')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('.summary-stats')).toContainText('93/93');
  const finished = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(finished.rewardedUnits).toEqual([1, 2, 3]);
  expect(finished.dates).toBe(150);
  expect(finished.ownedSkins).toContain('sailor');
  expect(errors).toEqual([]);
});

test('restores pending feedback after reload and keeps the next unit locked', async ({ page }) => {
  await seed(page);
  await page.goto('/#/unit/1/lesson/vocab-1');
  const bank = questions(UNITS[0], activities(UNITS[0])[0], 'id');
  for (const q of bank.slice(0, 10)) await answer(page, q);
  const q = bank[10];
  await page.locator(`input[value="${q.answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel')).toBeVisible();
  await page.reload();
  await expect(page.locator('.feedback-panel')).toBeVisible();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', q.id);
  await page.locator('.feedback-panel button').click();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', bank[11].id);
  await page.goto('/#/unit/2/lesson/quiz');
  await expect(page.locator('.journey-screen')).toBeVisible();
});

test('quiz failure has no reward; a later pass unlocks the next unit', async ({ page }) => {
  const unit = UNITS[1];
  await seed(page, { rewardedUnits: [1], completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u2:${a.id}`), mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])) });
  await page.goto('/#/unit/2/lesson/quiz');
  const bank = questions(unit, activities(unit).find(a => a.kind === 'quiz')!, 'id');
  for (const [i, q] of bank.entries()) await answer(page, q, i < 3);
  await expect(page.locator('.score-display')).toContainText('70');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(0);
  await page.getByRole('button', { name: 'حَاوِلْ مَرَّةً أُخْرَى', exact: true }).click();
  for (const q of bank) await answer(page, q);
  await expect(page.locator('.score-display')).toContainText('100');
  await page.locator('.result-actions a[href="#/unit/3"]').click();
  await expect(page.locator('.unit-screen')).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).ownedAnimals, STORAGE_KEY)).toContain('camel');
});

test('mobile layout, globe route cards, wardrobe save, theme and accessible screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page);
  await page.goto('/');
  await expect(page.locator('.mobile-nav')).toBeVisible();
  const mapLink = page.getByRole('link', { name: 'خَرِيطَةُ الرِّحْلَةِ', exact: true });
  await expect(page.locator('.journey-hero')).toBeVisible();
  await expect(page.locator('.globe-canvas')).toHaveCount(0);
  await mapLink.click();
  await expect(page).toHaveURL(/#\/map$/);
  await expect(page.locator('.globe-canvas[data-land="ready"]')).toBeVisible();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('Natural Earth', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tahapan rute' })).toHaveCount(0);
  const jakarta = page.getByRole('button', { name: 'Jakarta', exact: true });
  await jakarta.click();
  const card = page.getByRole('region', { name: 'Jakarta', exact: true });
  const startUnit = card.getByRole('link', { name: 'Buka wahdah Jakarta' });
  await expect(startUnit).toHaveAttribute('href', '#/unit/1');
  await expect(startUnit).toHaveClass(/md-btn--secondary/);
  await expect(card.getByText('2. Banten', { exact: true })).toBeVisible();
  await expect(card.getByText('Terkunci', { exact: true })).toHaveCount(2);
  const pinBounds = (await jakarta.boundingBox())!, cardBounds = (await card.boundingBox())!;
  expect(cardBounds.y).toBeGreaterThanOrEqual(pinBounds.y + pinBounds.height);
  expect(cardBounds.y - (pinBounds.y + pinBounds.height)).toBeLessThanOrEqual(12);
  await page.keyboard.press('Escape');
  await expect(card).not.toBeVisible();
  await expect(jakarta).toBeFocused();
  await page.getByRole('button', { name: 'Lihat seluruh rute' }).click();
  const muscat = page.getByRole('button', { name: 'Muscat', exact: true });
  await expect(muscat).toBeInViewport();
  const position = await muscat.boundingBox();
  const bounds = (await page.locator('.globe-canvas').boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 50, bounds.y + bounds.height / 4 + 25, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => muscat.boundingBox()).not.toEqual(position);
  await page.getByRole('button', { name: 'Lihat seluruh rute' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  let scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole('link', { name: 'Kembali ke perjalanan' }).click();
  await expect(page.locator('.globe-canvas')).toHaveCount(0);
  await page.locator('.mobile-nav a[href="#/wardrobe"]').click();
  scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole('radio', { name: 'وَرْدِيٌّ', exact: true }).locator('..').click();
  await page.getByRole('button', { name: 'احْفَظْ رَفِيقَكَ', exact: true }).click();
  await expect(page.locator('.saved-message')).toBeVisible();
  await page.locator('.mobile-nav a[href="#/profile"]').click();
  await page.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole('button', { name: 'إِعَادَةُ الْبَدْءِ', exact: true }).click();
  await page.getByRole('button', { name: 'اِحْتَفِظْ بِتَقَدُّمِي', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('corrupt storage does not crash or overwrite the old data', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '{damaged'), STORAGE_KEY);
  await page.goto('/');
  await expect(page.locator('.welcome')).toBeVisible();
  await expect(page.locator('.storage-warning')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('{damaged');
});

test('backup download, rejected damaged import, restore confirmation and explicit reset', async ({ page }) => {
  await seed(page, { dates: 60, xp: 125 });
  await page.goto('/#/profile');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'حِفْظُ نُسْخَةٍ', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^midad-progress-\d{4}-\d{2}-\d{2}\.json$/);
  await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.getByRole('status')).toContainText('تَعَذَّرَ قِرَاءَةُ الْمِلَفِ');
  const restored = { ...createProfile(), onboarded: true, dates: 90, xp: 150, language: 'en' };
  await page.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(restored)) });
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(60);
  await page.getByRole('button', { name: 'اسْتَعِدْ النُّسْخَةَ', exact: true }).click();
  await expect(page.locator('.journey-screen')).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(90);
  await page.goto('/#/profile');
  await page.getByRole('button', { name: 'إِعَادَةُ الْبَدْءِ', exact: true }).click();
  await page.getByRole('button', { name: 'احْذِفْ وَابْدَأْ مِنْ جَدِيدٍ', exact: true }).click();
  await expect(page.locator('.welcome')).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(0);
});

test('recognition accepts a matching transcript; denied microphone remains skippable without credit', async ({ page }) => {
  await seed(page, { completedActivities: ['u1:vocab-1', 'u1:pattern', 'u1:vocab-2'] });
  await page.addInitScript(() => {
    class FakeRecognition {
      onresult?: (e: unknown) => void;
      onerror?: (e: unknown) => void;
      onend?: () => void;
      start() {
        const text = document.querySelector('.arabic-cue')?.textContent;
        if (text?.includes('كَيْفَ')) this.onerror?.({ error: 'not-allowed' });
        else this.onresult?.({ results: [[{ transcript: text }]] });
        this.onend?.();
      }
      abort() { this.onend?.(); }
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: FakeRecognition, configurable: true });
  });
  await page.goto('/#/unit/1/lesson/dialogue');
  await page.getByRole('button', { name: 'ابْدَأِ التَّسْجِيلَ', exact: true }).click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.locator('.feedback-panel button').click();
  await page.getByRole('button', { name: 'ابْدَأِ التَّسْجِيلَ', exact: true }).click();
  await expect(page.locator('.speech-message')).toContainText('لَمْ يُسْمَحْ');
  await page.locator('.speech-skip').click();
  await expect(page.locator('.feedback-panel.skipped')).toBeVisible();
  const current = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(current.session.answers[1]).toMatchObject({ correct: false, skipped: true });
  expect(current.xp).toBe(5);
  expect(current.reviews[current.session.answers[1].questionId].reason).toBe('speech-skipped');
});

test('a saved mistake is reviewed after navigation and pending feedback survives reload without losing the lesson', async ({ page }) => {
  const activity = activities(UNITS[0])[0], bank = questions(UNITS[0], activity, 'id'), q = bank[10];
  const initial = { ...createProfile(), onboarded: true, session: { unitId: 1, activityId: 'vocab-1', cursor: 10, answers: bank.slice(0, 10).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false, wordId: q.word!.idKey })), hintAt: null } };
  await seed(page, initial);
  await page.goto('/#/unit/1/lesson/vocab-1');
  await answer(page, q, true);
  await page.goto('/');
  await page.locator('a.review-card[href="#/review"]').click();
  await expect(page.locator('.review-list li')).toHaveCount(1);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'اِبْدَأِ الْمُرَاجَعَةَ', exact: true }).click();
  await expect(page.getByRole('button', { name: 'التَّرْجَمَةُ مُقْفَلَةٌ فِي هَذَا السُّؤَالِ', exact: true })).toBeDisabled();
  await page.locator(`input[value="${q.answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.reload();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.locator('.feedback-panel button').click();
  await expect(page.locator('.result-screen')).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.reviews).toEqual({}); expect(saved.xp).toBe(5); expect(saved.session.cursor).toBe(11);
  expect(saved.mastery[q.word!.idKey]).toBe(1);
});

test('skipped speaking remains in the review list after another skip', async ({ page }) => {
  const q = questions(UNITS[0], activities(UNITS[0]).find(a => a.kind === 'dialogue')!, 'id')[0];
  const initial = recordLearningAnswer({ ...createProfile(), onboarded: true }, q.id, false, true, false);
  await seed(page, initial);
  await page.goto('/#/review');
  await page.getByRole('button', { name: 'اِبْدَأِ الْمُرَاجَعَةَ', exact: true }).click();
  await page.locator('.speech-skip').click();
  await page.locator('.feedback-panel button').click();
  await expect(page.locator('.result-screen')).toBeVisible();
  await page.reload();
  await expect(page.locator('.review-list li')).toHaveCount(1);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).xp, STORAGE_KEY)).toBe(0);
});

test('vocabulary search supports Arabic and translations, persists filters, and keeps locked sessions inaccessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await seed(page, { translation: true, mastery: { 'u1-w1': 3, 'u1-w2': 1 } });
  await page.goto('/#/unit/1');
  await page.locator('a.vocabulary-open-link').click();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(30);
  await expect(page.locator('.vocabulary-session-locked')).not.toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('searchbox').fill('السلام');
  await expect(page.locator('.vocabulary-entry')).toHaveCount(30);
  await page.getByRole('button', { name: 'اِبْحَثْ', exact: true }).click();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('السلام');
  await expect(page.locator('.vocabulary-entry')).toHaveCount(3);
  await page.locator('#vocabulary-mastered').check();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(3);
  await page.getByRole('button', { name: 'اِبْحَثْ', exact: true }).click();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(1);
  await expect(page.getByRole('img', { name: '3 إِجَابَاتٍ صَحِيحَةٍ مِنْ ٣', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'مَسْحُ الْبَحْثِ', exact: true }).click();
  await page.getByRole('searchbox').fill('GOOD MORNING');
  await page.getByRole('button', { name: 'اِبْحَثْ', exact: true }).click();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(2);
  await page.getByRole('searchbox').fill('nothing-matches-this');
  await page.getByRole('button', { name: 'اِبْحَثْ', exact: true }).click();
  await expect(page.locator('.vocabulary-empty')).toBeVisible();
  await page.getByRole('button', { name: 'عَرْضُ كُلِّ الْكَلِمَاتِ', exact: true }).click();
  await expect(page.locator('.vocabulary-entry')).toHaveCount(30);
  await page.goto('/#/unit/2/words');
  await expect(page.locator('.journey-screen')).toBeVisible();
});

test('an early quiz requires a choice before starting, then resumes without warning again after reload', async ({ page }) => {
  const unit = UNITS[0];
  await seed(page, { completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.slice(0, 24).map(w => [w.idKey, 3])) });
  await page.goto('/#/unit/1/lesson/quiz');
  await expect(page.locator('.quiz-readiness')).toBeVisible();
  await expect(page.locator('.readiness-percentage')).toHaveText('80%');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).session, STORAGE_KEY)).toBeNull();
  await page.locator('.quiz-readiness a[href="#/unit/1/words"]').click();
  await expect(page.locator('.vocabulary-screen')).toBeVisible();
  await page.goto('/#/unit/1/lesson/quiz');
  await page.getByRole('button', { name: 'جَرِّبِ الْاِخْتِبَارَ', exact: true }).click();
  await expect(page.locator('.question-body')).toBeVisible();
  const bank = questions(unit, activities(unit).find(a => a.kind === 'quiz')!, 'id');
  await page.locator(`input[value="${bank[0].answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await page.reload();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await expect(page.locator('.quiz-readiness')).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).session.questionVersion, STORAGE_KEY)).toBe(2);
});

test('an old vocabulary-only quiz keeps its last pending feedback and rewards after the quiz-bank upgrade', async ({ page }) => {
  const unit = UNITS[0], quiz = activities(unit).find(a => a.kind === 'quiz')!, old = questions(unit, quiz, 'id', 1);
  await seed(page, { completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.map(w => [w.idKey, 3])), session: { unitId: 1, activityId: 'quiz', cursor: 8, answers: old.slice(0, 9).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false, wordId: q.word!.idKey })), hintAt: null } });
  await page.goto('/#/unit/1/lesson/quiz');
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', old[8].id);
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.locator('.feedback-panel button').click();
  await answer(page, old[9]);
  await expect(page.locator('.score-display')).toContainText('100');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).dates, STORAGE_KEY)).toBe(50);
  await page.locator('.result-actions a[href="#/unit/1"]').click();
  await page.locator('a.activity-card[href="#/unit/1/lesson/quiz"]').click();
  await expect(page.locator('.question-body')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).session.questionVersion, STORAGE_KEY)).toBe(2);
});

test('two mistakes offer a hint without spending it; the hint removes an eliminated selection and survives reload', async ({ page }) => {
  await seed(page, { session: vocabularyCheckpoint(12, [false, false]) });
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.hint-offer')).toBeVisible();
  const q = questions(UNITS[0], activities(UNITS[0])[0], 'id')[12], eliminated = q.choices!.find(c => c.id !== q.answer)!;
  await page.locator(`input[value="${eliminated.id}"]`).locator('..').click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).hintsUsed, STORAGE_KEY)).toBe(0);
  await page.getByRole('button', { name: 'تَلْمِيحٌ', exact: true }).click();
  await expect(page.locator('.answer-choice.eliminated')).toHaveCount(1);
  await expect(page.locator(`input[value="${eliminated.id}"]`)).not.toBeChecked();
  await expect(page.getByTestId('check-answer')).toBeDisabled();
  await page.reload();
  await expect(page.locator('.hint-xp')).toBeVisible();
  await expect(page.getByRole('button', { name: 'تَلْمِيحٌ', exact: true })).toHaveCount(0);
  await page.locator(`input[value="${q.answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).hintsUsed, STORAGE_KEY)).toBe(1);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).xp, STORAGE_KEY)).toBe(2);
});

test('idle help waits for twenty seconds after the latest interaction and stays clickable when offered', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-23T09:00:00Z') });
  await seed(page, { session: vocabularyCheckpoint(10) });
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.question-body')).toBeVisible();
  await page.clock.fastForward(18000);
  await expect(page.locator('.hint-offer')).toHaveCount(0);
  await page.locator('.answer-choice').first().click();
  await page.clock.fastForward(18000);
  await expect(page.locator('.hint-offer')).toHaveCount(0);
  await page.clock.fastForward(2500);
  await expect(page.locator('.hint-offer')).toBeVisible();
  await page.getByRole('button', { name: 'تَلْمِيحٌ', exact: true }).click();
  await expect(page.locator('.hint-xp')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).hintsUsed, STORAGE_KEY)).toBe(1);
});

test('switching lessons preserves both pending answers, the used hint and XP through the saved lesson links', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const vocabulary = questions(UNITS[0], activities(UNITS[0])[0], 'id')[10], checkpoint = vocabularyCheckpoint(10);
  const response = { questionId: vocabulary.id, correct: true, skipped: false, hinted: true, wordId: vocabulary.word!.idKey };
  await seed(page, { translation: true, completedActivities: ['u1:vocab-1'], xp: 2, hintsUsed: 1, creditedQuestions: [vocabulary.id], mastery: { [vocabulary.word!.idKey]: 1 }, session: { ...checkpoint, hintAt: 10, answers: [...checkpoint.answers, response] } });
  await page.goto('/#/unit/1');
  await page.locator('a.activity-card[href="#/unit/1/lesson/pattern"]').click();
  const pattern = questions(UNITS[0], activities(UNITS[0]).find(a => a.id === 'pattern')!, 'id')[0];
  for (const word of pattern.words!) await page.locator('.word-bank button:enabled').and(page.getByRole('button', { name: word, exact: true })).first().click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('.saved-lessons > .resume-card')).toHaveAttribute('href', '#/unit/1/lesson/pattern');
  const disclosure = page.locator('.other-lessons > summary');
  await disclosure.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.other-lessons')).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('.other-lessons a[href="#/unit/1/lesson/vocab-1"]').click();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', vocabulary.id);
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await expect(page.locator('.hint-xp')).toHaveCount(0);
  const restored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(restored.xp).toBe(7); expect(restored.hintsUsed).toBe(1); expect(restored.session.hintAt).toBe(10);
  expect(restored.savedSessions['u1:pattern'].answers[0].correct).toBe(true);
  await page.locator('.feedback-panel button').click();
  await page.goto('/#/unit/1');
  await expect(page.locator('.checkpoint-note')).toHaveCount(2);
  await page.locator('a.activity-card[href="#/unit/1/lesson/pattern"]').click();
  await page.reload();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', pattern.id);
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).xp, STORAGE_KEY)).toBe(7);
  await page.goto('/#/profile');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'حِفْظُ نُسْخَةٍ', exact: true }).click();
  const stream = await (await download).createReadStream(), chunks: Buffer[] = [];
  if (!stream) throw new Error('No backup download stream');
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks), payload = JSON.parse(backup.toString());
  expect(payload.savedSessions['u1:vocab-1'].cursor).toBe(11);
  expect(payload.session.answers[0].questionId).toBe(pattern.id);
  await page.getByRole('button', { name: 'إِعَادَةُ الْبَدْءِ', exact: true }).click();
  await page.getByRole('button', { name: 'احْذِفْ وَابْدَأْ مِنْ جَدِيدٍ', exact: true }).click();
  await expect(page.locator('.welcome')).toBeVisible();
  await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  await page.getByRole('button', { name: 'اِبْدَأْ', exact: true }).click();
  await page.goto('/#/profile');
  await page.locator('input[type=file]').setInputFiles({ name: 'all-checkpoints.json', mimeType: 'application/json', buffer: backup });
  await page.getByRole('button', { name: 'اسْتَعِدْ النُّسْخَةَ', exact: true }).click();
  await page.locator('.other-lessons > summary').click();
  await page.locator('.other-lessons a[href="#/unit/1/lesson/vocab-1"]').click();
  const nextVocabulary = questions(UNITS[0], activities(UNITS[0])[0], 'id')[11];
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', nextVocabulary.id);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).xp, STORAGE_KEY)).toBe(7);
});

test('a parked legacy quiz resumes its feedback at eighty percent mastery without a new readiness prompt', async ({ page }) => {
  const unit = UNITS[0], old = questions(unit, activities(unit).find(a => a.id === 'quiz')!, 'id', 1);
  const saved = { unitId: 1, activityId: 'quiz', cursor: 8, answers: old.slice(0, 9).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false })), hintAt: null };
  await seed(page, { completedActivities: activities(unit).filter(a => a.kind !== 'quiz').map(a => `u1:${a.id}`), mastery: Object.fromEntries(unit.words.slice(0, 24).map(word => [word.idKey, 3])), session: vocabularyCheckpoint(0), savedSessions: { 'u1:quiz': saved } });
  await page.goto('/#/unit/1/lesson/quiz');
  await expect(page.locator('.quiz-readiness')).toHaveCount(0);
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', old[8].id);
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.reload();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  const profile = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(profile.session.questionVersion).toBe(1); expect(profile.savedSessions['u1:vocab-1'].cursor).toBe(0);
});

test('the third quiz leads to an accessible summary with actual mastery, rewards and useful review links', async ({ page }) => {
  const mastery = Object.fromEntries(UNITS.flatMap(unit => unit.words.map(word => [word.idKey, 3])));
  mastery['u1-w1'] = 1;
  const missed = questions(UNITS[0], activities(UNITS[0])[0], 'id')[10];
  await seed(page, { translation: true, theme: 'light', dates: 80, xp: 60, rewardedUnits: [1, 2], bestScores: { '1': 80, '2': 90 }, completedActivities: UNITS.flatMap(unit => activities(unit).filter(a => unit.id < 3 || a.kind !== 'quiz').map(a => `u${unit.id}:${a.id}`)), mastery, reviews: { [missed.id]: { reason: 'incorrect', failures: 1, lastAttemptDay: '2026-11-23' } } });
  await page.goto('/#/unit/3/lesson/quiz');
  const bank = questions(UNITS[2], activities(UNITS[2]).find(a => a.id === 'quiz')!, 'id');
  for (const q of bank) await answer(page, q);
  await expect(page.locator('.score-display')).toContainText('100');
  await page.locator('.result-actions a[href="#/summary"]').click();
  await expect(page.locator('.summary-screen')).toBeVisible();
  await expect(page.locator('#main-title')).toBeFocused();
  await expect(page.locator('.summary-stats dd')).toHaveText(['3/3', '99/100', '1']);
  await expect(page.locator('.summary-unit-facts dd')).toHaveText(['80%', '29/30', '90%', '35/35', '100%', '35/35']);
  await expect(page.locator('.summary-gift a')).toHaveAttribute('href', '#/wardrobe');
  await expect(page.locator('.summary-actions a[href="#/unit/1/words"]')).toBeVisible();
  await expect(page.locator('.summary-actions a[href="#/review"]')).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.reload();
  await expect(page.locator('.summary-stats dd')).toHaveText(['3/3', '99/100', '1']);
  let profile = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(profile.dates).toBe(130); expect(profile.xp).toBe(90); expect(profile.ownedSkins).toContain('sailor');
  await page.locator('.summary-actions a[href="#/review"]').click();
  await expect(page.locator('.review-list li')).toHaveCount(1);
  await page.goto('/');
  await page.locator('.demo-complete-card').click();
  await expect(page.locator('.summary-screen')).toBeVisible();
  await page.goto('/#/profile');
  await page.locator('#theme').selectOption('dark');
  await page.locator('a[href="#/summary"]').click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('.summary-gift a').click();
  await expect(page.locator('.wardrobe-screen')).toBeVisible();
  profile = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(profile.dates).toBe(130); expect(profile.xp).toBe(90);
});

test('the completion summary remains unavailable until all three units have been passed', async ({ page }) => {
  await seed(page, { rewardedUnits: [1, 2] });
  await page.goto('/#/summary');
  await expect(page.locator('.journey-screen')).toBeVisible();
  await expect(page.locator('.demo-complete-card')).toHaveCount(0);
  const profile = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(profile.dates).toBe(0); expect(profile.ownedSkins).not.toContain('sailor');
});


for (const passedA1 of [false, true]) {
  test(`placement ${passedA1 ? 'opens the A2 section and reports its limit' : 'recommends A1 below the threshold'}`, async ({ page }) => {
    await page.goto('/');
    const next = page.getByRole('button', { name: 'مُتَابَعَة', exact: true });
    await next.click();
    await next.click();
    await page.getByRole('button', { name: /Ikut tes tahdid mustawa/ }).click();
    const bank = [...placementQuestions(1, 'id'), ...(passedA1 ? placementQuestions(2, 'id') : [])];
    for (const q of bank) {
      await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', q.id);
      if (q.kind === 'order') {
        const words = q.id === 't07' ? [q.words!.at(-1)!, ...q.words!.slice(0, -1)] : q.words!;
        for (const word of words) await page.locator('.word-bank button:enabled').and(page.getByRole('button', { name: word, exact: true })).first().click();
      } else {
        const correct = passedA1 || q.kind === 'listen';
        const choice = q.choices!.find(c => (c.id === q.answer) === correct)!;
        await page.locator(`input[type="radio"][value="${choice.id}"]`).locator('..').click();
      }
      await page.getByTestId('check-answer').click();
    }
    await expect(page.getByRole('heading', { name: /Hasil tes tahdid/ })).toBeVisible();
    await expect(page.getByText(passedA1 ? 'A1 · 5/5 · A2 · 5/5' : 'A1 · 3/5', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Mulai belajar A1/ }).click();
    await expect(page.locator('.journey-screen')).toBeVisible();
  });
}
