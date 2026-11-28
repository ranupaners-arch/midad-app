#!/usr/bin/env node
// Salin kalimat spanduk naik level dari ui-strings.json (Shaharil) ke app/src/domain/levelup-strings.json. Pakai: node scripts/sync-levelup-strings.mjs [folderKonten]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src) { console.error('Pemakaian: node scripts/sync-levelup-strings.mjs <src>'); process.exit(1); }
const e = JSON.parse(readFileSync(join(src, 'ui-strings.json'), 'utf8')).strings['levelup.banner'];
if (!e || !e.ar) throw new Error('levelup.banner tidak ada di ui-strings.json');
writeFileSync(join(root, 'app/src/domain/levelup-strings.json'), JSON.stringify({ banner: { ar: e.ar, id: e.id, en: e.en } }, null, 1) + '\n');
console.log('levelup-strings.json ditulis');
