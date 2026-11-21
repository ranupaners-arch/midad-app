#!/usr/bin/env node
// Membuat paket aset siap pakai dari design-system/ ke dist/paket-aset/ (+ dist/Midad-Aset.zip bila `zip` ada).
// Struktur folder mengikuti paket 20 Nov 2026 (halaman Notion "10 Paket Aset (ZIP)").
// Pakai: node scripts/build-paket.mjs [--no-zip]
import { cpSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ds = (p) => join(root, 'design-system', p);
const dist = join(root, 'dist');
const out = join(dist, 'paket-aset');

execFileSync(process.execPath, [join(root, 'scripts/build-css.mjs'), '--check'], { stdio: 'inherit' });

rmSync(out, { recursive: true, force: true });
const copy = (from, to, filter) => cpSync(from, join(out, to), { recursive: true, filter });
const noTypes = (src) => !/\.d\.mts$/.test(src);

copy(ds('assets/maskot'), 'Maskot', noTypes);
copy(ds('assets/ikon'), 'Ikon');
copy(ds('assets/rihlah'), 'Rihlah');
mkdirSync(join(out, 'Token'), { recursive: true });
copy(ds('tokens.json'), 'Token/tokens.json');
copy(ds('tokens.css'), 'Token/tokens.css');
mkdirSync(join(out, 'Komponen'), { recursive: true });
for (const f of ['bundle.css', 'components.css']) copy(ds(`components/${f}`), `Komponen/${f}`);
copy(ds('prototypes'), 'Prototipe');
copy(join(root, 'docs/pratinjau'), 'Pratinjau');

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(out, 'BACA-SAYA.md'), `# Midad — Paket Aset (${today})

Dibuat otomatis dari repo (\`node scripts/build-paket.mjs\`). Jangan edit isi paket ini; ubah sumbernya di \`design-system/\`.

- Maskot/    SVG 5 hewan (hudhud default), mascot.js + vehicles.js (pakai <script>), mascot.mjs + vehicles.mjs (ES module + validasi), png/ 512px
- Ikon/      lencana انظر / استمع / أعد, ikon hint dan mentor, png/
- Rihlah/    routes.json (rute ID & EN), tips.json (16 tips loading)
- Token/     tokens.json (sumber) dan tokens.css (variabel CSS, tema terang/gelap)
- Komponen/  components.css (kelas md-*, untuk aplikasi) dan bundle.css (font + preview + komponen, kompatibel lama)
- Prototipe/ kustomisasi-maskot.html (buka di browser)
- Pratinjau/ gambar ringkas maskot dan kendaraan

Pakai di HTML: tokens.css lalu components.css, dan muat font Google lewat <link> (lihat design-system/README.md).
Kurikulum: 4 marhalah (A1–B2) × 16 wahdah = 64 level, diselaraskan dengan CEFR.
`);

const count = (dir) => readdirSync(dir).reduce((n, f) => n + (statSync(join(dir, f)).isDirectory() ? count(join(dir, f)) : 1), 0);
console.log(`dist/paket-aset: ${count(out)} file.`);

if (!process.argv.includes('--no-zip')) {
  const zip = join(dist, 'Midad-Aset.zip');
  rmSync(zip, { force: true });
  try {
    execFileSync('zip', ['-qr', zip, '.'], { cwd: out });
    console.log(`dist/Midad-Aset.zip: ${(statSync(zip).size / 1024).toFixed(0)} KB.`);
  } catch {
    console.warn('`zip` tidak tersedia, ZIP dilewati.');
  }
}
