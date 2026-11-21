#!/usr/bin/env node
// Build CSS design system:
//   design-system/tokens.json            -> design-system/tokens.css
//   preview.css + components.css         -> design-system/components/bundle.css (kompatibel lama)
// Tema: terang di :root, gelap lewat [data-theme="dark"] atau prefers-color-scheme
// (kecuali pengguna memaksa [data-theme="light"]).
// Pakai: node scripts/build-css.mjs [--check]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ds = (p) => join(root, 'design-system', p);
const t = JSON.parse(readFileSync(ds('tokens.json'), 'utf8'));

export const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@500;700&display=swap';

// ---------- tokens.css ----------
const themed = [...t.color.tokens, ...t.shadow.tokens];
const flat = [...t.spacing.tokens, ...t.radius.tokens, ...t.size.tokens];
for (const tok of themed) {
  if (!tok.value || tok.value.light == null || tok.value.dark == null) {
    throw new Error(`Token ${tok.name} tidak punya nilai light/dark`);
  }
}
const decl = (name, value) => `  --${name}: ${value};`;
const block = (sel, lines) => `${sel} {\n${lines.join('\n')}\n}`;
const darkLines = ['  color-scheme: dark;', ...themed.map(x => decl(x.name, x.value.dark))];
const rootLines = [
  '  color-scheme: light;',
  '  /* warna & bayangan (tema terang) */',
  ...themed.map(x => decl(x.name, x.value.light)),
  '  /* keluarga font */',
  ...Object.entries(t.type.families).map(([k, v]) => decl(`font-${k}`, v)),
  '  /* skala tipografi */',
  ...t.type.groups.flatMap(g => g.styles.flatMap(s => [
    decl(`fs-${s.name}`, s.fontSize),
    decl(`lh-${s.name}`, s.lineHeight),
    decl(`fw-${s.name}`, String(s.fontWeight)),
  ])),
  '  /* spacing, radius, ukuran */',
  ...flat.map(x => decl(x.name, x.value)),
];
const typeClasses = t.type.groups.flatMap(g => g.styles.map(s =>
  `.md-type-${s.name} { font-family: var(--font-${g.family}); font-size: var(--fs-${s.name}); line-height: var(--lh-${s.name}); font-weight: var(--fw-${s.name}); }`
));
const tokensCss = [
  '/* DIBUAT OTOMATIS dari tokens.json oleh scripts/build-css.mjs. Jangan edit manual. */',
  block(':root', rootLines),
  block(':root[data-theme="dark"]', darkLines),
  `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', darkLines).replace(/^/gm, '  ')}\n}`,
  '/* kelas tipografi */',
  ...typeClasses,
  '',
].join('\n\n');

// ---------- bundle.css (untuk design system interaktif lama: font + preview + komponen) ----------
const bundleCss = [
  `@import url("${FONTS_URL}");`,
  '/* DIBUAT OTOMATIS oleh scripts/build-css.mjs dari preview.css + components.css. Jangan edit manual.',
  '   Aplikasi memakai tokens.css + components.css, bukan file ini. */',
  readFileSync(ds('components/preview.css'), 'utf8'),
  readFileSync(ds('components/components.css'), 'utf8'),
].join('\n');

const outputs = { 'tokens.css': tokensCss, 'components/bundle.css': bundleCss };

if (process.argv.includes('--check')) {
  let ok = true;
  for (const [p, css] of Object.entries(outputs)) {
    let cur = '';
    try { cur = readFileSync(ds(p), 'utf8'); } catch {}
    if (cur !== css) { console.error(`${p} tidak sinkron. Jalankan: node scripts/build-css.mjs`); ok = false; }
  }
  if (!ok) process.exit(1);
  console.log('CSS sinkron.');
} else {
  for (const [p, css] of Object.entries(outputs)) writeFileSync(ds(p), css);
  console.log(`tokens.css: ${themed.length} token bertema, ${flat.length} token tetap, ${typeClasses.length} gaya teks.`);
  console.log('components/bundle.css: dibuat ulang.');
}
