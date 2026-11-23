import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  testMatch: '**/pwa.spec.ts',
  testIgnore: [],
  outputDir: 'test-results/pwa',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4173', serviceWorkers: 'allow' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
