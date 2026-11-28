import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  testMatch: '**/app.spec.ts',
  grep: /mobile demo journey|placement |quiz failure|recognition accepts|restores pending feedback|backup download/,
  outputDir: 'test-results/workflow-audit',
  reporter: [['list'], ['html', { outputFolder: 'test-results/workflow-report', open: 'never' }]],
  workers: 2,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4173', video: 'on', trace: 'on', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 30000 },
});
