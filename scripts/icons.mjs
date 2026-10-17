/* Erzeugt die App-Zeichen (PNG) aus icon/zentrale.svg. Nur nach Änderungen am Zeichen nötig:
 * PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/icons.mjs */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const svg = readFileSync(root + 'icon/zentrale.svg', 'utf8');
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage();
for (const [name, groesse, maske] of [['zentrale-192.png', 192], ['zentrale-512.png', 512], ['zentrale-180.png', 180], ['zentrale-maske-512.png', 512, true]]) {
  await page.setViewportSize({ width: groesse, height: groesse });
  const bild = maske ? svg.replace('rx="112"', 'rx="0"') : svg;
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${groesse}px;height:${groesse}px;display:block}</style>${bild}`);
  await page.screenshot({ path: root + 'icon/' + name, omitBackground: !maske });
  console.log('icon/' + name);
}
await browser.close();
