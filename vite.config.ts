import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'],
    manifest: {
      id: './', name: 'مِدَاد — Midad', short_name: 'مِدَاد', lang: 'ar', dir: 'rtl', start_url: './', scope: './',
      description: 'تَعَلَّمِ الْعَرَبِيَّةَ قَطْرَةً قَطْرَةً', display: 'standalone', background_color: '#fbf6ec', theme_color: '#0f766e',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      cacheId: 'midad',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: false,
      navigateFallback: 'index.html',
      globPatterns: ['**/*.{js,css,html,svg,png,woff2,woff,txt}'],
      runtimeCaching: [],
    },
    devOptions: { enabled: false },
  })],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] } },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { outDir: '../dist/app', emptyOutDir: true },
});
