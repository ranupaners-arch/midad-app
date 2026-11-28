import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { renderMascot } from '../design-system/assets/maskot/mascot.mjs';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';
import { friendAnimal, SCENE_DEFS, sceneFor } from '../app/src/domain/scenes';

const CONTINUE = 'مُتَابَعَة';
// Cari pelajaran (wahdah + aktivitas) yang memuat kartu belajar kata perempuan.
const found = SHAHARIL_UNITS.flatMap(u => activities(u).map(a => ({ u, a, cards: questions(u, a, 'id').filter(q => q.kind === 'study') })))
  .map(x => ({ ...x, idx: x.cards.findIndex(q => sceneFor(q.word?.audioKey)?.friendFemale) })).find(x => x.idx >= 0);
const studyCards = found?.cards ?? [], femaleIdx = found?.idx ?? -1;
const lessonUrl = found ? `/#/unit/${found.u.id}/lesson/${found.a.id}` : '/';

const sameSvg = (page: Page, selector: string, expected: string) => page.evaluate(([sel, exp]) => {
  const norm = (s: string) => s.replace(/mm\d+/g, 'mmN');
  const d = document.createElement('div'); d.innerHTML = exp;
  return norm(document.querySelector(sel)!.innerHTML) === norm(d.innerHTML);
}, [selector, expected] as const);

async function openAt(page: Page, mascot: Record<string, unknown>, index: number) {
  const p = createProfile();
  const profile = { ...p, onboarded: true, curriculum: 'shaharil', completedActivities: ['u1:vocab-1', 'u1:pattern'], ownedAnimals: ['camel', 'turtle', 'oryx', 'cat'], ownedItems: [...p.ownedItems, 'head:peci'], mascot: { ...p.mascot, ...mascot } };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto(lessonUrl);
  await expect(page.locator('.study-card')).toBeVisible();
  for (let i = 0; i < index; i++) await page.getByRole('button', { name: CONTINUE, exact: true }).click();
}

test('kata perempuan: hanya teman di adegan yang berpita dan berok; maskot pengguna tidak memakai penanda', async ({ page }) => {
  expect(femaleIdx).toBeGreaterThanOrEqual(0);
  const mascot = { animal: 'camel', color: 'white', head: 'peci' };
  await openAt(page, mascot, femaleIdx);
  const def = sceneFor(studyCards[femaleIdx].word?.audioKey)!;
  await expect(page.locator('.study-card .word-scene')).toHaveAttribute('data-mode', 'duo');
  await expect(page.locator('.study-card [data-role=friend]')).toHaveAttribute('data-female', 'true');
  expect(await sameSvg(page, '.study-card [data-role=friend]', renderMascot({ animal: friendAnimal('camel'), mark: 'female' }, { label: '' }))).toBe(true);
  expect(await sameSvg(page, '.study-card [data-role=user]', renderMascot({ ...createProfile().mascot, ...mascot, ...(def.emote ? { emote: def.emote } : {}) }, { label: '' }))).toBe(true);
  expect(await page.locator('.study-card [data-role=user] svg').innerHTML()).not.toContain('#e56b8a');
});

test('adegan lain tidak pernah memakai penanda perempuan', async () => {
  for (const [key, def] of Object.entries(SCENE_DEFS)) if (def.friendFemale) expect(['w1-v19', 'w2-v07'], key).toContain(key);
  expect(Object.values(SCENE_DEFS).filter(d => d.friendFemale).length).toBe(2);
});

for (const scheme of ['light', 'dark'] as const) test(`kartu kata perempuan lolos axe (${scheme}) dan tanpa error`, async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ colorScheme: scheme });
  await openAt(page, { animal: 'turtle', color: 'sea' }, femaleIdx);
  expect((await new AxeBuilder({ page }).include('.study-card').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('pengguna yang memilih kucing: teman perempuan adalah Hudhud berpita dan berok', async ({ page }) => {
  await openAt(page, { animal: 'cat' }, femaleIdx);
  expect(await sameSvg(page, '.study-card [data-role=friend]', renderMascot({ animal: 'hudhud', mark: 'female' }, { label: '' }))).toBe(true);
});
