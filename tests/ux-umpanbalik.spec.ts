import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { activities, questions, SHAHARIL_UNITS } from '../app/src/domain/content';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

// Lembar umpan balik (UX [06][07]): jawaban tidak dobel, lembar ringkas, satu area gulir, pilihan terakhir terjangkau, terjemahan tidak patah. Aturan
// "terjemahan terkunci saat soal" TIDAK diubah (diuji tetap terkunci).
const unit = SHAHARIL_UNITS[0], bank = questions(unit, activities(unit)[0], 'id');
const at = (kind: string, text: string, meaning: boolean) => bank.findIndex(q => q.kind === kind && q.text?.id === text && !!q.meaningTest === meaning);
const MEANING = at('choice', 'selamat sore, selamat petang', true), LISTEN = at('listen', "wa'alaikumussalam (balasan salam)", false), MEANING_LONG = at('choice', "wa'alaikumussalam (balasan salam)", true);
const SIZES = [{ width: 360, height: 812 }, { width: 320, height: 568 }];

async function open(page: Page, index: number, size: { width: number; height: number }, translation = true) {
  const session = { unitId: 1, activityId: 'vocab-1', questionVersion: 2, cursor: index, answers: bank.slice(0, index).map(b => ({ questionId: b.id, correct: true, skipped: false, hinted: false })), hintAt: null };
  const profile = { ...createProfile(), onboarded: true, curriculum: 'shaharil', translation, language: 'id', session };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
  await page.setViewportSize(size);
  await page.goto('/#/unit/1/lesson/vocab-1');
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', bank[index].id);
}
async function answerWrong(page: Page, index: number) {
  const q = bank[index];
  await page.locator(`input[value="${q.choices!.find(c => c.id !== q.answer)!.id}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.wrong')).toBeVisible();
}
const geometry = (page: Page) => page.evaluate(() => {
  const r = (s: string) => document.querySelector(s)!.getBoundingClientRect(), fc = document.querySelector('.feedback-copy')!, qa = document.querySelector('.question-actions')!;
  const content = document.querySelector('.question-content')!; content.scrollTo(0, content.scrollHeight);
  const last = [...document.querySelectorAll('.answer-choice')].pop()!.getBoundingClientRect(), actions = r('.question-actions');
  return { sheet: actions.height, nestedFeedback: fc.scrollHeight - fc.clientHeight, nestedSheet: qa.scrollHeight - qa.clientHeight, lastBottom: last.bottom, lastTop: last.top, actionsTop: actions.top, vh: innerHeight };
});

test('jawaban benar hanya ditulis sekali di lembar umpan balik soal makna; terjemahan kunci soal tetap terkunci', async ({ page }) => {
  expect(MEANING).toBeGreaterThan(0);
  await open(page, MEANING, SIZES[0]);
  await expect(page.locator('.translation-toggle')).toBeDisabled();                                // aturan lama: terkunci saat soal makna
  await answerWrong(page, MEANING);
  const text = await page.locator('.feedback-panel').innerText();
  expect(text.split('selamat sore, selamat petang').length - 1).toBe(1);
  await expect(page.locator('.feedback-panel .correct-answer')).toHaveText('selamat sore, selamat petang');
  await expect(page.locator('.feedback-copy .translation')).toHaveCount(0);
});

test('soal dengar: jawaban Arab DAN terjemahannya tetap tampil (informasi tidak hilang)', async ({ page }) => {
  expect(LISTEN).toBeGreaterThan(0);
  await open(page, LISTEN, SIZES[0]);
  await answerWrong(page, LISTEN);
  await expect(page.locator('.feedback-panel .correct-answer')).toContainText('وَعَلَيْكُمُ');
  await expect(page.locator('.feedback-copy .translation')).toHaveText("wa'alaikumussalam (balasan salam)");
});

for (const size of SIZES) for (const [name, index] of [['soal makna', MEANING], ['soal dengar', LISTEN]] as const) {
  test(`lembar ringkas, satu area gulir, pilihan terakhir terjangkau: ${name} ${size.width}x${size.height}`, async ({ page }) => {
    await open(page, index, size);
    await answerWrong(page, index);
    const g = await geometry(page);
    expect(g.sheet).toBeLessThanOrEqual(195);                                                       // sebelumnya 218-234 px
    expect(g.sheet / size.height).toBeLessThanOrEqual(size.height > 700 ? 0.25 : 0.34);
    expect(g.nestedFeedback).toBeLessThanOrEqual(1); expect(g.nestedSheet).toBeLessThanOrEqual(1); // tidak ada gulir bersarang di lembar
    expect(g.lastBottom).toBeLessThanOrEqual(g.actionsTop + 1);                                     // pilihan terakhir di atas lembar setelah digulir
    expect(g.lastTop).toBeGreaterThanOrEqual(0);
    await expect(page.locator('.feedback-panel button')).toBeVisible();
  });
}

test('teks terjemahan/jawaban tidak menyisakan satu kata sendirian pada baris terakhir (320 px)', async ({ page }) => {
  await open(page, MEANING_LONG, SIZES[1]);
  await answerWrong(page, MEANING_LONG);
  const lines = await page.locator('.feedback-panel .correct-answer.native-answer').evaluate(el => {
    const node = el.firstChild as Text, words = [...node.data.matchAll(/\S+/g)], rows: Record<number, number> = {};
    for (const w of words) { const range = document.createRange(); range.setStart(node, w.index!); range.setEnd(node, w.index! + w[0].length); const top = Math.round(range.getClientRects()[0].top); rows[top] = (rows[top] ?? 0) + 1; }
    return Object.keys(rows).sort((a, b) => +a - +b).map(k => rows[+k]);
  });
  if (lines.length > 1) expect(lines[lines.length - 1]).toBeGreaterThanOrEqual(2);
});

for (const scheme of ['light', 'dark'] as const) test(`umpan balik salah dan benar lolos axe (${scheme}, 360x812)`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await open(page, LISTEN, SIZES[0]);
  await answerWrong(page, LISTEN);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
