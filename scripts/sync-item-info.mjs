// Salin teks penjelasan item (kunci item.{xp,dates,streak,hint,mastery}.{name,use,get}) dari ui-strings.json Shaharil ke
// app/src/domain/itemInfo.json, apa adanya (tidak ada Arab tulisan sendiri). Pakai: node scripts/sync-item-info.mjs [folder-konten]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = process.argv[2];
if (!content) { console.error('Pemakaian: node scripts/sync-item-info.mjs <content>'); process.exit(1); }
const strings = JSON.parse(readFileSync(join(content, 'ui-strings.json'), 'utf8').replace(/^\uFEFF/, '')).strings;
const out = {}, missing = [];
for (const item of ['xp', 'dates', 'streak', 'hint', 'mastery']) {
  out[item] = {};
  for (const part of ['name', 'use', 'get']) {
    const s = strings[`item.${item}.${part}`];
    if (!s?.ar || !s?.id || !s?.en) { missing.push(`item.${item}.${part}`); continue; }
    out[item][part] = { ar: s.ar, id: s.id, en: s.en };
  }
}
if (missing.length) { console.error('Kunci kurang di ui-strings.json: ' + missing.join(', ')); process.exit(1); }
writeFileSync(join(root, 'app/src/domain/itemInfo.json'), JSON.stringify(out, null, 1) + '\n');
console.log('itemInfo.json: 5 item x 3 teks');