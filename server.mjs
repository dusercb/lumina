// Zero-dependency static server for app/. `node server.mjs` serves on this computer only;
// `node server.mjs --lan` also prints an address a phone on the same Wi-Fi can open.
// Set CSP="..." to test the page under a Content-Security-Policy header.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { networkInterfaces } from 'node:os';

const ROOT = resolve('app');
const PORT = Number(process.env.PORT) || 5173;
const LAN = process.argv.includes('--lan');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
  '.tflite': 'application/octet-stream',
};

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    let file = resolve(ROOT, '.' + decodeURIComponent(pathname));
    if (file !== ROOT && !file.startsWith(ROOT + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...(process.env.CSP ? { 'Content-Security-Policy': process.env.CSP } : {}),
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, LAN ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Lumina: http://localhost:${PORT}`);
  if (!LAN) return;
  for (const list of Object.values(networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal) console.log(`On a phone on the same Wi-Fi: http://${a.address}:${PORT}`);
    }
  }
});
