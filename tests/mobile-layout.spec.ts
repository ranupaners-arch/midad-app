import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

async function prepare(page: Page, changes = {}) {
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation: true, ...changes };
  await page.addInitScript(({ key, profile }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(profile));
    Object.defineProperty(speechSynthesis, 'getVoices', { value: () => [] });
  }, { key: STORAGE_KEY, profile });
}

async function reachable(control: Locator) {
  await expect(control).toBeVisible();
  expect(await control.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return rect.top >= 0 && rect.bottom <= innerHeight + 1 && rect.left >= 0 && rect.right <= innerWidth + 1
      && !!hit && element.contains(hit);
  })).toBe(true);
}

async function noPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1
    && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const size of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 664 }]) {
  test.describe(`${size.width}×${size.height} lesson actions`, () => {
    test.use({ viewport: size });

    test('choices and pending feedback stay reachable through reload and advance', async ({ page }) => {
      const unit = SHAHARIL_UNITS[0], activity = activities(unit)[0];
      const bank = questions(unit, activity, 'id'), cursor = activity.words!.length;
      await prepare(page, { session: { unitId: 1, activityId: activity.id, questionVersion: 2, cursor,
        answers: bank.slice(0, cursor).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false, wordId: q.word!.idKey })), hintAt: null } });
      await page.goto('/#/unit/1/lesson/vocab-1');
      await reachable(page.getByTestId('check-answer'));
      for (const option of await page.locator('.answer-choice').all()) await reachable(option);
      await noPageOverflow(page);
      const wrong = bank[cursor].choices!.find(c => c.id !== bank[cursor].answer)!;
      await page.locator(`input[value="${wrong.id}"]`).locator('..').click();
      await page.getByTestId('check-answer').click();
      await reachable(page.locator('.feedback-panel button'));
      await page.reload();
      await reachable(page.locator('.feedback-panel button'));
      await page.locator('.feedback-panel button').click();
      await reachable(page.getByTestId('check-answer'));
      await noPageOverflow(page);
    });

    test('all reading passages work with either translation setting and enlarged text', async ({ page }) => {
      await prepare(page, { translation: false, rewardedUnits: [1, 2],
        completedActivities: SHAHARIL_UNITS.flatMap(u => activities(u).filter(a => a.kind !== 'quiz').map(a => `u${u.id}:${a.id}`)) });
      for (const unit of SHAHARIL_UNITS) {
        await page.goto(`/#/unit/${unit.id}/lesson/reading`);
        await expect(page.locator('.question-title .translation')).toHaveCount(0);
        await reachable(page.getByTestId('check-answer'));
        const passage = page.locator('.reading-passage');
        await passage.focus();
        await page.keyboard.press('End');
        await expect.poll(() => passage.evaluate(el => el.scrollTop > 0)).toBe(true);
        await page.getByRole('button', { name: 'تَرْجَمَة', exact: true }).click();
        await expect(passage.locator('.translation')).toBeVisible();
        await reachable(page.getByTestId('check-answer'));
        await noPageOverflow(page);
        await page.getByRole('button', { name: 'تَرْجَمَة', exact: true }).click();
      }
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      await reachable(page.getByTestId('check-answer'));
      const options = page.locator('.answer-choice');
      await options.last().scrollIntoViewIfNeeded();
      await options.last().click();
      await page.getByTestId('check-answer').click();
      await reachable(page.locator('.feedback-panel button'));
      await noPageOverflow(page);
    });

    test('unavailable audio and denied microphone keep the skip action reachable', async ({ page }) => {
      await prepare(page, { completedActivities: ['u1:vocab-1', 'u1:pattern', 'u1:vocab-2'] });
      await page.addInitScript(() => {
        class DeniedRecognition {
          onerror?: (event: unknown) => void;
          onend?: () => void;
          start() { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }
          abort() { this.onend?.(); }
        }
        Object.defineProperty(window, 'SpeechRecognition', { value: DeniedRecognition, configurable: true });
      });
      await page.goto('/#/unit/1/lesson/dialogue');
      await expect(page.locator('.audio-note')).toBeVisible();
      await reachable(page.locator('.speech-skip'));
      await page.getByRole('button', { name: 'ابْدَأِ التَّسْجِيلَ', exact: true }).click();
      await expect(page.locator('.speech-message')).toContainText('لَمْ يُسْمَحْ');
      await reachable(page.locator('.speech-skip'));
      await page.locator('.speech-skip').click();
      await reachable(page.locator('.feedback-panel.skipped button'));
      const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
      expect(saved.session.answers[0]).toMatchObject({ skipped: true, correct: false });
      await noPageOverflow(page);
    });

    test('the unit starts above the fold and resumes the saved question', async ({ page }) => {
      await prepare(page, { translation: false });
      await page.goto('/#/unit/1');
      const start = page.locator('.unit-start');
      await reachable(start);
      await expect(page.locator('.language-note p')).toBeHidden();
      await page.locator('.language-note summary').click();
      await expect(page.locator('.language-note p')).toBeVisible();
      await expect(page.locator('.language-note .translation')).toHaveCount(0);
      await page.getByRole('button', { name: 'تَرْجَمَة', exact: true }).click();
      await expect(page.locator('.language-note p .translation')).toBeVisible();
      await start.click();
      await page.locator('.question-actions button').click();
      const savedId = await page.locator('.question-body').getAttribute('data-question-id');
      await page.locator('.lesson-header a').click();
      await reachable(start);
      await expect(start).toHaveAttribute('href', '#/unit/1/lesson/vocab-1');
      await start.click();
      await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', savedId!);
    });

    test('companion options and save remain separate and the selection persists', async ({ page }) => {
      await prepare(page);
      await page.goto('/#/wardrobe');
      const save = page.locator('.wardrobe-save button');
      await reachable(save);
      for (const index of [4, 0]) {
        const animal = page.locator('.animal-picker label').nth(index);
        await animal.scrollIntoViewIfNeeded();
        await reachable(animal);
        await animal.click();
        await expect(animal.locator('input')).toBeChecked();
        await reachable(save);
      }
      const pink = page.getByRole('radio', { name: 'وَرْدِيٌّ', exact: true });
      await pink.locator('..').click();
      await reachable(save);
      await save.click();
      await expect(page.locator('.saved-message')).toBeVisible();
      await reachable(save);
      await noPageOverflow(page);
      await page.reload();
      await expect(pink).toBeChecked();
      await reachable(save);
    });
  });
}
