import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import type { Page } from '@playwright/test';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';
import { activities, questions, SHAHARIL_UNITS, UNITS } from '../app/src/domain/content';
import AxeBuilder from '@axe-core/playwright';

async function prepare(page: Page, changes = {}) {
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: { ...createProfile(), onboarded: true, ...changes } });
}
async function ready(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test('production precaches lessons, fonts and mascot assets and restores progress while completely offline', async ({ page, context }) => {
  const external: string[] = [], errors: string[] = [];
  page.on('request', req => { if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') external.push(req.url()); });
  page.on('pageerror', e => errors.push(e.message));
  await prepare(page, { curriculum: 'shaharil', completedActivities: ['u1:vocab-1'] });
  await page.goto('/');
  await ready(page);
  const manifest = await page.evaluate(async () => (await fetch(document.querySelector<HTMLLinkElement>('link[rel=manifest]')!.href)).json());
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192', type: 'image/png' }), expect.objectContaining({ sizes: '512x512', purpose: 'maskable' })]));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.journey-screen')).toBeVisible();
  await expect(page.locator('.availability-banner')).toContainText('بِدُونِ اتِّصَالٍ');
  await page.goto('/#/wardrobe');
  await page.getByRole('radio', { name: 'وَرْدِيٌّ', exact: true }).locator('..').click();
  await page.getByRole('button', { name: 'احْفَظْ رَفِيقَكَ', exact: true }).click();
  await page.goto('/#/unit/1/lesson/vocab-1');
  const firstUnit = SHAHARIL_UNITS[0];
  const bank = questions(firstUnit, activities(firstUnit)[0], 'id');
  for (let i = 0; i < 10; i++) await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  const q = bank[10];
  await page.locator(`input[value="${q.answer}"]`).locator('..').click();
  await page.getByTestId('check-answer').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await page.reload();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.session.cursor).toBe(10); expect(saved.xp).toBe(5); expect(saved.mascot.color).toBe('pink');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('Noto Naskh Arabic') && f.status === 'loaded'))).toBe(true);
  await page.goto('/#/unit/1/lesson/pattern');
  await expect(page.locator('.word-bank')).toBeVisible();
  await page.reload();
  await expect(page.locator('.word-bank')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).savedSessions['u1:vocab-1'].cursor, STORAGE_KEY)).toBe(10);
  await page.goto('/');
  await page.locator('.other-lessons > summary').click();
  await page.locator('.other-lessons a[href="#/unit/1/lesson/vocab-1"]').click();
  await expect(page.locator('.feedback-panel.correct')).toBeVisible();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', q.id);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).xp, STORAGE_KEY)).toBe(5);
  await page.goto('/#/profile');
  await expect(page.getByTestId('offline-status')).toContainText('جَاهِزَةٌ');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(external).toEqual([]); expect(errors).toEqual([]);
});

test('a service worker update waits for consent, then reloads without discarding a lesson checkpoint', async ({ page }) => {
  let revision = 1;
  const root = resolve('dist/app');
  const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2' };
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url!, 'http://localhost').pathname);
      const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
      let body: Buffer | string = await readFile(path);
      if (pathname === '/sw.js') body = body.toString() + `\n// Update lifecycle test revision ${revision}\n`;
      res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server address');
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await prepare(page);
    await page.goto(origin);
    await ready(page);
    await page.goto(origin + '/#/unit/1/lesson/vocab-1');
    await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    revision++;
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())!.update(); });
    await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
    await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', 'u1-vocab-1-study-1');
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
    await expect(page.locator('.update-banner')).toHaveCount(0);
    await page.goto(origin + '/#/profile');
    await expect(page.locator('.update-banner')).toBeVisible();
    await Promise.all([page.waitForEvent('load'), page.locator('.update-banner button').click()]);
    expect(await page.evaluate(() => performance.timeOrigin)).toBeGreaterThan(timeOrigin);
    await expect(page.locator('.profile-screen')).toBeVisible();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).session.cursor, STORAGE_KEY)).toBe(1);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('blocked service worker registration leaves online learning and saved progress usable', async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => { navigator.serviceWorker.register = () => Promise.reject(new Error('Blocked for test')); });
  await page.goto('/#/profile');
  await expect(page.getByText(/لَمْ يَتَمَكَّنِ الْمُتَصَفِّحُ/)).toBeVisible();
  await page.goto('/#/unit/1/lesson/vocab-1');
  await page.getByRole('button', { name: 'مُتَابَعَة', exact: true }).click();
  await page.reload();
  await expect(page.locator('.question-body')).toHaveAttribute('data-question-id', 'u1-vocab-1-study-1');
});

test('the completed journey summary remains readable after an offline reload without awarding rewards again', async ({ page, context }) => {
  await prepare(page, { translation: true, dates: 150, xp: 90, rewardedUnits: [1, 2, 3], ownedSkins: ['none', 'sailor'], bestScores: { '1': 100, '2': 90, '3': 80 }, mastery: Object.fromEntries(UNITS.flatMap(unit => unit.words.map(word => [word.idKey, 3]))) });
  await page.goto('/');
  await ready(page);
  await context.setOffline(true);
  await page.locator('.demo-complete-card').click();
  await page.reload();
  await expect(page.locator('.summary-screen')).toBeVisible();
  await expect(page.locator('.summary-stats dd')).toHaveText(['3/3', '100/100', '0']);
  await expect(page.locator('.summary-units > li')).toHaveCount(3);
  await expect(page.locator('.summary-gift')).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.dates).toBe(150); expect(saved.xp).toBe(90);
});
