/* Schneller Fehlercheck ohne Browser:
 * 1. JavaScript in index.html ist syntaktisch gültig
 * 2. HTML-Grundgerüst stimmt, keine doppelten IDs
 * 3. Von außen nur die Schrift (Google Fonts), keine Scripts, keine Analytics
 * 4. Keine Kundendaten, Dokumente oder Schlüssel im Repo (es ist öffentlich)
 * Exit-Code 1 bei Fehlern. */
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [], warns = [];
const html = await readFile(root + 'index.html', 'utf8');

/* 1. Syntax */
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!scripts.length) errors.push('index.html: kein <script> gefunden');
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `index.html <script #${i + 1}>` }); }
  catch (e) { errors.push(`Syntaxfehler in Script ${i + 1}: ${e.message}`); }
});

/* 2. HTML und IDs */
for (const need of ['<!doctype html>', '<meta charset', 'name="viewport"', '<title>'])
  if (!html.toLowerCase().includes(need.toLowerCase())) errors.push(`index.html: ${need} fehlt`);
/* Nur das feste HTML; was die Scripts zeichnen, prüft der Browsertest zur Laufzeit. */
const ohneScripts = html.replace(/<script\b[\s\S]*?<\/script>/g, '');
const ids = [...ohneScripts.matchAll(/\bid="([^"$]+)"/g)].map(m => m[1]);
for (const d of new Set(ids.filter((v, i, a) => a.indexOf(v) !== i))) errors.push(`ID doppelt vergeben: #${d}`);

/* 3. Von außen nur Google Fonts */
for (const m of html.matchAll(/<(?:script|link|img|iframe)\b[^>]*(?:src|href)="(?:https?:)?\/\/([^/"]+)[^"]*"/g))
  if (!/^fonts\.(googleapis|gstatic)\.com$/.test(m[1])) errors.push(`Externe Quelle in index.html: ${m[1]}`);
if (/googletagmanager|analytics/.test(html)) errors.push('index.html lädt Analytics');

/* 4. Kundendaten und Schlüssel */
let files = [];
try { files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean); }
catch { warns.push('git nicht verfügbar, Datencheck übersprungen'); }
for (const f of files) {
  if (/\.(xlsx?|xlsm|pdf|docx?|csv)$/i.test(f)) errors.push(`Dokument im Repo: ${f} (Kundenunterlagen gehören nicht hierher)`);
  if (/\.(js|mjs|cjs|html|md|json|yml)$/.test(f)) {
    const t = await readFile(root + f, 'utf8').catch(() => '');
    if (/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-ant-[A-Za-z0-9-]{20,}|sb_secret_[A-Za-z0-9_-]{10,}/.test(t)) errors.push(`Möglicher Zugangsschlüssel in ${f}`);
    if (/\bDE\d{2}(?: ?\d{4}){4} ?\d{2}\b/.test(t)) errors.push(`Sieht nach einer IBAN aus: ${f}`);
  }
}

for (const w of warns) console.log('⚠️  ' + w);
if (errors.length) { console.log('❌ Fehlercheck fehlgeschlagen:'); for (const e of errors) console.log('   • ' + e); process.exit(1); }
console.log(`✅ Fehlercheck ok (${scripts.length} Scripts, ${ids.length} IDs, ${files.length} Dateien geprüft)`);
