import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createProfile, STORAGE_KEY } from '../app/src/domain/progress';

async function seed(page: Page, changes = {}) {
  const profile = { ...createProfile(), onboarded: true, ...changes };
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: STORAGE_KEY, value: profile });
}
const unit1Done = ['u1:vocab-1', 'u1:pattern', 'u1:vocab-2', 'u1:dialogue', 'u1:vocab-3', 'u1:reading', 'u1:practice', 'u1:quiz'];
const midway = { rewardedUnits: [1], completedActivities: [...unit1Done, 'u2:vocab-1', 'u2:pattern'] };
const pin = (page: Page, n: number) => page.locator(`.station-pin[data-station="${n}"]`);

test('stasiun tampil sebagai titik di peta; yang aktif terpilih dan panelnya memuat tautan wahdah', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-canvas[data-land="ready"]')).toBeVisible();
  await expect(page.locator('.globe-canvas')).toHaveCount(0);
  await expect(page.locator('.station-pin')).toHaveCount(3);
  await expect(page.locator('.unit-path')).toHaveCount(0);
  // nama aksesibel: Arab dari data (ordinal, judul wahdah) + pelabuhan
  await expect(pin(page, 1)).toHaveAttribute('aria-label', /^الْوَحْدَةُ الْأُولَى: .+ · Jakarta · تَمَّ$/);
  await expect(pin(page, 2)).toHaveAttribute('aria-label', /^الْوَحْدَةُ الثَّانِيَةُ: .+ · Banten$/);
  await expect(pin(page, 3)).toHaveAttribute('aria-label', /^الْوَحْدَةُ الثَّالِثَةُ: .+ · Lampung · مُقْفَلٌ$/);
  await expect(pin(page, 2)).toHaveAttribute('aria-pressed', 'true');
  const panel = page.getByTestId('station-panel');
  await expect(panel).toHaveAttribute('data-station', '2');
  await expect(panel.locator('a.unit-link[href="#/unit/2"]')).toContainText('2/8');
  // ketuk titik wahdah 1 -> ringkasan wahdah 1 (selesai: tombol مُرَاجَعَةٌ)
  await pin(page, 1).click();
  await expect(panel).toHaveAttribute('data-station', '1');
  await expect(panel.locator('a.unit-link[href="#/unit/1"]')).toContainText('مُرَاجَعَةٌ');
  await panel.locator('a.unit-link').click();
  await expect(page).toHaveURL(/#\/unit\/1$/);
  expect(errors).toEqual([]);
});

test('stasiun terkunci: panel menolak membuka dan alamat langsung dialihkan', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  await expect(page.locator('.station-pin')).toHaveCount(3);
  await pin(page, 3).click();
  const panel = page.getByTestId('station-panel');
  await expect(panel).toHaveAttribute('data-station', '3');
  await expect(panel.locator('.locked-caption')).toContainText('أَكْمِلِ الْوَحْدَةَ السَّابِقَةَ');
  await expect(panel.locator('a')).toHaveCount(0);
  await page.goto('/#/unit/3/lesson/vocab-1');
  await expect(page).not.toHaveURL(/lesson/);
  await page.goto('/#/unit/3');
  await expect(page.locator('.station-pin')).toHaveCount(3);
});

test('keyboard: Tab mencapai titik, Enter memilih, fokus terlihat, dan tautan wahdah bisa diaktifkan', async ({ page }) => {
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-canvas[data-land="ready"]')).toBeVisible();
  await pin(page, 1).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('station-panel')).toHaveAttribute('data-station', '1');
  const outline = await pin(page, 1).locator('.station-dot').evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(pin(page, 2)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByTestId('station-panel')).toHaveAttribute('data-station', '2');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('.station-panel a.unit-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/unit\/2$/);
});

for (const width of [320, 360, 412]) {
  test(`HP ${width}px terang dan gelap: tanpa luapan, target sentuh >= 44 px, titik di dalam peta, axe bersih`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await seed(page, midway);
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/'); await page.reload();
      await expect(page.locator('.station-canvas[data-land="ready"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const mapBox = (await page.getByTestId('station-map').boundingBox())!;
      for (const n of [1, 2, 3]) {
        const box = (await pin(page, n).boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(mapBox.x); expect(box.x + box.width).toBeLessThanOrEqual(mapBox.x + mapBox.width);
        expect(box.y).toBeGreaterThanOrEqual(mapBox.y); expect(box.y + box.height).toBeLessThanOrEqual(mapBox.y + mapBox.height);
      }
      const link = (await page.locator('.station-panel a.unit-link').boundingBox())!;
      expect(link.height).toBeGreaterThanOrEqual(44);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).include('.station-wrap').analyze();
      expect(scan.violations).toEqual([]);
    }
  });
}

test('titik tidak saling menumpuk (jarak antar titik >= 44 px)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-canvas[data-land="ready"]')).toBeVisible();
  const boxes = await Promise.all([1, 2, 3].map(async n => (await pin(page, n).boundingBox())!));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    expect(Math.hypot(boxes[i].x - boxes[j].x, boxes[i].y - boxes[j].y)).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion mematikan denyut titik aktif; gerak normal menyalakannya', async ({ page }) => {
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-pin.current')).toHaveCount(1);
  const animation = () => page.locator('.station-pin.current .station-dot').evaluate(el => getComputedStyle(el).animationName);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(animation).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(animation).toBe('station-pulse');
});
test('peta dasar gagal dimuat: titik dan panel tetap berfungsi; tidak ada permintaan jaringan baru selain berkas peta', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', r => { if (!r.url().includes('/@') && !/\.(js|css|woff2?|svg|png|tsx?|json)(\?|$)/.test(r.url()) || /world-countries/.test(r.url())) requests.push(r.url()); });
  await page.route(/world-countries/, route => route.request().resourceType() === 'fetch' ? route.abort() : route.continue());
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-pin')).toHaveCount(3);
  await pin(page, 1).click();
  await expect(page.getByTestId('station-panel')).toHaveAttribute('data-station', '1');
  const external = requests.filter(u => !u.startsWith(new URL(page.url()).origin));
  expect(external).toEqual([]);
});

test('tanpa kanvas (getContext null): daftar cadangan menampilkan wahdah dengan tautan; terkunci tanpa tautan', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-list')).toBeVisible();
  await expect(page.locator('.station-row')).toHaveCount(3);
  await expect(page.locator('.station-row a.unit-link[href="#/unit/1"]')).toBeVisible();
  await expect(page.locator('.station-row a.unit-link[href="#/unit/2"]')).toBeVisible();
  await expect(page.locator('.station-row.locked a')).toHaveCount(0);
  await expect(page.locator('.station-row.locked .locked-caption')).toBeVisible();
});

test('layar Perjalanan tetap memuat peta globe lewat tombol الْخَرِيطَةُ dan wahdah 4 "segera" tetap tampil', async ({ page }) => {
  await seed(page, midway);
  await page.goto('/');
  await expect(page.locator('.station-next')).toContainText('قَرِيبًا');
  await page.getByRole('link', { name: 'خَرِيطَةُ الرِّحْلَةِ', exact: true }).click();
  await expect(page.locator('.globe-canvas[data-land="ready"]')).toBeVisible();
});
