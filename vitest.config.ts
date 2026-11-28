import { defineConfig } from 'vitest/config';
// Tes ekonomi asli berjalan dengan mode demo mati (lihat app/src/domain/demo.ts).
export default defineConfig({ test: { include: ['app/src/**/*.test.ts'], environment: 'node', env: { VITE_DEMO_UNLOCK_ALL: '0' } } });
