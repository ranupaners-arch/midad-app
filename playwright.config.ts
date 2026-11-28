import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results/app',
  testIgnore: '**/pwa.spec.ts',
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:5173', actionTimeout: 10000, reducedMotion: 'reduce', trace: 'retain-on-failure', launchOptions: { executablePath } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev', env: { VITE_DEMO_UNLOCK_ALL: '0' }, // tes bawaan menguji ekonomi asli; tes mode demo memakai ?demo=1
    url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
