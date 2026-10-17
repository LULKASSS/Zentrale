/* Lokaler Server: http://localhost:5190 ist der Entwurf (erfundene Kunden, speichert im Tab).
 * /konto ist die echte Fassung gegen einen Test-Speicher (test/konto.spec.js baut Supabase nach),
 * /konto?echt gegen das echte Projekt aus wolke.json. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bauen, MANIFEST, ICONS, ZIEL } from './bauen.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = +(process.env.PORT || 5190);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = decodeURIComponent(url.pathname);
  const datei = path.split('/').pop();
  if (datei === 'manifest.webmanifest') { res.writeHead(200, { 'content-type': 'application/manifest+json' }).end(MANIFEST); return; }
  if (ICONS.includes(datei)) { res.writeHead(200, { 'content-type': 'image/png' }).end(await readFile(root + 'icon/' + datei)); return; }
  if (path === '/konto' || path === '/konto/') {
    const ziel = url.searchParams.has('echt') ? ZIEL : { url: 'https://test.invalid', key: 'test' };
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(bauen(ziel));
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (!file.startsWith(root) || file.includes('node_modules')) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404).end('nicht gefunden');
  }
}).listen(port, '127.0.0.1', () => console.log(`Zentrale läuft auf http://localhost:${port} (Entwurf), /konto (mit Konto)`));
