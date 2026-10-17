/* Baut die echte Fassung für GitHub Pages: index.html mit dem Ziel aus wolke.json (Supabase-Adresse und
 * öffentlicher Schlüssel, wie bei Klar), dazu Manifest und App-Zeichen. Ohne Ziel bleibt es der Entwurf.
 * Aufruf: node scripts/bauen.mjs [public/index.html] */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export const ZIEL = existsSync(root + 'wolke.json') ? JSON.parse(readFileSync(root + 'wolke.json', 'utf8')) : null;
export const ICONS = ['zentrale-192.png', 'zentrale-512.png', 'zentrale-180.png', 'zentrale-maske-512.png'];
export const MANIFEST = JSON.stringify({
  name: 'Zentrale', short_name: 'Zentrale', lang: 'de', start_url: './', scope: './', display: 'standalone',
  background_color: '#F6F6F8', theme_color: '#7F5FE8',
  icons: [
    { src: 'zentrale-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'zentrale-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'zentrale-maske-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 1);

export function bauen(ziel = ZIEL) {
  let html = readFileSync(root + 'index.html', 'utf8');
  const titel = '<title>Zentrale</title>';
  if (!html.includes(titel)) throw new Error('<title>Zentrale</title> fehlt');
  let kopf = titel + '\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="zentrale-180.png">\n<meta name="theme-color" content="#7F5FE8">';
  if (ziel) kopf += '\n<script type="application/json" id="wolkeziel">' + JSON.stringify({ url: ziel.url, key: ziel.key }).replace(/</g, '\\u003c') + '</script>';
  return html.replace(titel, () => kopf);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const aus = process.argv[2] || root + 'public/index.html';
  if (!ZIEL) throw new Error('wolke.json fehlt');
  mkdirSync(dirname(aus), { recursive: true });
  const html = bauen();
  writeFileSync(aus, html);
  writeFileSync(dirname(aus) + '/manifest.webmanifest', MANIFEST);
  for (const f of ICONS) copyFileSync(root + 'icon/' + f, dirname(aus) + '/' + f);
  console.log(`✅ ${aus} gebaut (${(html.length / 1024).toFixed(0)} KB, mit Konto)`);
}
