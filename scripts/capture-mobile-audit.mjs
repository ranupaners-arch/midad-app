// Requires the Vite dev server. Captures the app in headless Chromium without moving desktop focus.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const output = resolve(process.argv[2] ?? 'test-results/design-audit');
const base = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:5173';
await mkdir(output, { recursive: true });
const evidence = [];
let revision = 0;

async function seed(page, route, options = {}) {
  await page.evaluate(async options => {
    const { createProfile, beginSession, STORAGE_KEY } = await import('/src/domain/progress.ts');
    const { unitsFor, activities, questions } = await import('/src/domain/content.ts');
    let profile = { ...createProfile(), curriculum: 'shaharil', onboarded: true, translation: options.translation ?? false };
    const unit = unitsFor(profile)[0], list = activities(unit);
    if (options.activity) {
      const activity = list.find(a => a.id === options.activity);
      profile.completedActivities = list.slice(0, list.indexOf(activity)).map(a => `u1:${a.id}`);
      profile = beginSession(profile, 1, activity.id);
      if (options.cursor) {
        const bank = questions(unit, activity, profile.language);
        profile.session.cursor = options.cursor;
        profile.session.answers = bank.slice(0, options.cursor).map(q => ({ questionId: q.id, correct: true, skipped: false, hinted: false, wordId: q.word?.idKey }));
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, options);
  await page.goto(`${base}/?capture=${++revision}#${route}`);
  await page.locator('#main-title').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function capture(page, name) {
  const metrics = await page.evaluate(() => {
    const selectors = ['.unit-start', '.activity-card', '.question-content', '.reading-passage', '.question-actions button', '.feedback-panel', '.wardrobe-stage', '.animal-picker label', '.wardrobe-content', '.wardrobe-save', '.mobile-nav'];
    return { viewport: [innerWidth, innerHeight], document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
      elements: Object.fromEntries(selectors.map(selector => [selector, [...document.querySelectorAll(selector)].map(element => {
        const r = element.getBoundingClientRect();
        return { text: element.textContent.trim().slice(0, 90), x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom,
          scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
      })])) };
  });
  await page.screenshot({ path: join(output, `${name}.png`) });
  evidence.push({ name, ...metrics });
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 664 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => { Object.defineProperty(speechSynthesis, 'getVoices', { value: () => [] }); });
  await page.goto(base);
  for (const size of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 664 }]) {
    await page.setViewportSize(size);
    for (const [name, route, options] of [
      ['unit', '/unit/1', {}], ['wardrobe', '/wardrobe', {}],
      ['study', '/unit/1/lesson/vocab-1', { activity: 'vocab-1', translation: true }],
      ['choice', '/unit/1/lesson/vocab-1', { activity: 'vocab-1', cursor: 10 }],
      ['reading', '/unit/1/lesson/reading', { activity: 'reading', translation: true }],
      ['dialogue', '/unit/1/lesson/dialogue', { activity: 'dialogue', translation: true }],
    ]) {
      await seed(page, route, options);
      await capture(page, `${name}-${size.width}`);
    }
  }
} finally { await browser.close(); }

await writeFile(join(output, 'measurements.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(`Saved ${evidence.length} captures/measurements to ${output}`);
