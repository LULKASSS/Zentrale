/* Baut aus index.html die Fassung fürs Claude-Artifact (ohne doctype/html/head/body,
   die setzt der Artifact-Dienst selbst). Aufruf: node scripts/artefakt.mjs <ziel.html> */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ziel = process.argv[2];
if (!ziel) { console.error('Ziel fehlt: node scripts/artefakt.mjs <ziel.html>'); process.exit(1); }
const html = await readFile(root + 'index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
await writeFile(ziel, head.trim() + '\n' + body.trim() + '\n');
console.log('Artifact-Fassung geschrieben: ' + ziel);
