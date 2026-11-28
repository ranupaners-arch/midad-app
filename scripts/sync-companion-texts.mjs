// Salin teks balon companion (kunci companion.tip.N, companion.motivasi.N, companion.mahfuzhat.N) dari ui-strings.json Shaharil ke
// app/src/domain/companionTexts.json, apa adanya (tidak ada Arab tulisan sendiri). Pakai: node scripts/sync-companion-texts.mjs [folder-konten]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = process.argv[2];
if (!content) { console.error('Pemakaian: node scripts/sync-companion-texts.mjs <content>'); process.exit(1); }
const strings = JSON.parse(readFileSync(join(content, 'ui-strings.json'), 'utf8').replace(/^\uFEFF/, '')).strings;
const out = {};
for (const kind of ['tip', 'motivasi', 'mahfuzhat']) {
  out[kind] = [];
  for (let n = 1; strings[`companion.${kind}.${n}`]; n++) {
    const s = strings[`companion.${kind}.${n}`];
    if (!s.ar || !s.id || !s.en) { console.error(`companion.${kind}.${n}: ar/id/en tidak lengkap`); process.exit(1); }
    out[kind].push({ ar: s.ar, id: s.id, en: s.en });
  }
  if (!out[kind].length) { console.error(`Tidak ada kunci companion.${kind}.* di ui-strings.json`); process.exit(1); }
}
writeFileSync(join(root, 'app/src/domain/companionTexts.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`companionTexts.json: tip ${out.tip.length}, motivasi ${out.motivasi.length}, mahfuzhat ${out.mahfuzhat.length}`);
