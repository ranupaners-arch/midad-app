#!/usr/bin/env node
// Memastikan daftar nilai di mascot.d.mts / vehicles.d.mts sama dengan runtime mascot.js / vehicles.js,
// dan validateMascotConfig menolak nilai liar. Pakai: node scripts/check-mascot.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../design-system/assets/Maskot');
const { MidadMascot, validateMascotConfig, renderMascot } = await import(join(dir, 'mascot.mjs'));
const { MidadVehicles } = await import(join(dir, 'vehicles.mjs'));

const union = (src, name) => {
  const m = src.match(new RegExp(`type ${name} = ([^;]+);`));
  if (!m) throw new Error(`type ${name} tidak ditemukan`);
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).sort().join(',');
};
const keys = (o) => Object.keys(o).sort().join(',');
const errors = [];
const cmp = (label, a, b) => { if (a !== b) errors.push(`${label}\n  tipe:    ${a}\n  runtime: ${b}`); };

const mdts = readFileSync(join(dir, 'mascot.d.mts'), 'utf8');
const map = { Animal: 'ANIMALS', Eyes: 'EYES', Beak: 'BEAKS', Mouth: 'MOUTHS', Nose: 'NOSES', HeadItem: 'HEAD',
  NeckItem: 'NECK', HandItem: 'HAND', Skin: 'SKINS', Tier: 'TIERS', Emote: 'EMOTES' };
for (const [t, k] of Object.entries(map)) cmp(t, union(mdts, t), keys(MidadMascot[k]));
cmp('VehicleId', union(readFileSync(join(dir, 'vehicles.d.mts'), 'utf8'), 'VehicleId'), keys(MidadVehicles.V));

const v = validateMascotConfig({ animal: 'cat', color: 'constructor', style: '__proto__', eyes: '<x>' });
if (v.color !== 'ginger' || v.style !== 'patches' || v.eyes !== 'round') errors.push('validateMascotConfig tidak menolak nilai liar');
if (renderMascot({}, { label: '"><script>' }).includes('<script>')) errors.push('label tidak di-escape');

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Maskot & kendaraan: tipe cocok dengan runtime, validasi OK.');
