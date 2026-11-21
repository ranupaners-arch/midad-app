#!/usr/bin/env node
// Server statis kecil (tanpa dependensi) untuk membuka preview design system.
// Hanya mendengarkan di 127.0.0.1. Pakai: node scripts/serve.mjs [port]  ->  http://127.0.0.1:8765/preview/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname, sep } from 'node:path';

const base = join(dirname(fileURLToPath(import.meta.url)), '../design-system');
const port = Number(process.argv[2]) || 8765;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8' };

createServer(async (req, res) => {
  try {
    let path = normalize(join(base, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (path !== base && !path.startsWith(base + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404).end('Tidak ditemukan');
  }
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}/preview/`));
