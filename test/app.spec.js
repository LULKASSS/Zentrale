// Browsertests: Heute, Kunde anlegen, Akte mit Finanzen/Terminen/Aufgaben/Verlauf, Nachbereiten, Handy.
const { test, expect } = require('@playwright/test');

async function nachbereiteLea(page) {
  await page.goto('/');
  await page.click('[data-termin-oeffnen^="lea|"]');
  await page.click('#beispiel-mitschrift');
  await expect(page.locator('#speicher-hinweis')).toHaveText('gespeichert');
  await page.click('[data-nachbereiten^="lea|"]');
  await page.click('[data-weiter="0"]');
  await expect(page.locator('[data-thema-wahl]')).toHaveCount(6);
  await page.click('[data-weiter="1"]');
  for (let i = 2; i < 8; i++) await page.click(`[data-weiter="${i}"]`);
  await expect(page.locator('#ergebnis')).toBeVisible();
}

test('Heute zeigt, was nachzubereiten ist, was zu lange wartet und die nächsten Termine', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Samstag, 17. Oktober');
  await expect(page.locator('.nachbereiten-karte')).toContainText('Lea Muster');
  await expect(page.locator('.lzeile.mit-haken')).toHaveCount(2);
  await expect(page.locator('.abschnitt', { hasText: 'Nächste Termine' })).toContainText('Sven Testmann');
});

test('Kunde anlegen, Finanzen aufnehmen, Termin mit Mitschrift anlegen @mobil', async ({ page }) => {
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  await page.goto('/');
  await page.click('[data-geh="kunden"]');
  await page.click('[data-geh="neu"]');
  await page.click('button[type="submit"]');
  await expect(page.locator('#nk-fehler')).toHaveText('Vor- und Nachname fehlen noch.');
  await page.fill('#nk-vorname', 'Anna');
  await page.fill('#nk-nachname', 'Neu');
  await page.fill('#nk-jahr', '1993');
  await page.click('[data-taetigkeit="Angestellt"]');
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toHaveText('Anna Neu');
  await expect(page.locator('.profil')).toContainText('Angestellt, 33 Jahre');

  await page.click('[data-reiter="finanzen"] >> nth=0');
  await page.click('#finanzen-start');
  await page.click('[data-posten-dazu="ein|Gehalt"]');
  await expect(page.locator('[data-posten-betrag]').first()).toBeFocused();
  await page.keyboard.type('3.000');
  await page.click('[data-posten-dazu="fix|Miete"]');
  await page.keyboard.type('950');
  await expect(page.locator('#fin-frei')).toContainText('2.050');
  await page.click('[data-posten-dazu="fix|Strom"]');
  await page.keyboard.type('3000');
  await expect(page.locator('#fin-frei')).toContainText('−950');
  await expect(page.locator('#fin-frei-wort')).toHaveText('fehlen im Monat');

  await page.click('#neuer-termin');
  await page.click('#nt-anlegen');
  await expect(page.locator('h1')).toHaveText('Erstgespräch');
  await page.fill('#mitschrift', '- Haftpflicht fehlt');
  await expect(page.locator('#speicher-hinweis')).toHaveText('gespeichert');
  await page.click('.zurueck');
  await expect(page.locator('.termin-karte')).toContainText('Haftpflicht fehlt');
  await page.click('[data-reiter="verlauf"]');
  await expect(page.locator('.verlauf')).toContainText('Finanzen aktualisiert, frei −950 €');
  expect(fehler).toEqual([]);
});

test('Termin nachbereiten: Thema für Thema, dann Klar und Mail, Akte zieht nach @mobil', async ({ page }) => {
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  await nachbereiteLea(page);
  await expect(page.locator('#mailtext')).toHaveValue(/Bei dir:\n- BU: Kläre bitte/);
  await page.click('#uebernehmen');
  await expect(page.locator('h1')).toHaveText('Lea Muster');
  await expect(page.locator('.thema')).toHaveCount(6);
  await expect(page.locator('#toast')).toContainText('In Klar');
  await page.click('[data-reiter="aufgaben"]');
  await expect(page.locator('.punkte')).toContainText('Haftpflicht: Angebot rechnen');
  await page.click('[data-reiter="termine"]');
  await expect(page.locator('.termin-karte')).toContainText('Nachbereitet');
  await page.click('[data-geh="heute"]');
  await expect(page.locator('.abschnitt', { hasText: 'Nachbereiten' })).toContainText('Alle Termine sind nachbereitet');
  expect(fehler).toEqual([]);
});

test('Wer ist dran umstellen ändert Aufgabe und Mail', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-termin-oeffnen^="lea|"]');
  await page.click('#beispiel-mitschrift');
  await page.click('[data-nachbereiten^="lea|"]');
  await page.click('[data-weiter="0"]');
  await page.click('[data-weiter="1"]');
  await page.locator('[data-was="0"]').press('Enter');
  await expect(page.locator('[data-was="1"]')).toBeFocused();
  await page.click('[data-stand="erledigt"][data-i="1"]');
  await page.fill('[data-was="1"]', 'Kein Bedarf');
  for (let i = 3; i < 8; i++) await page.click(`[data-weiter="${i}"]`);
  await expect(page.locator('#ergebnis')).not.toContainText('Haftpflicht: Angebot rechnen');
  await expect(page.locator('#mailtext')).not.toHaveValue(/Haftpflicht/);
});

test('Mit dem Kunden ansehen: nur Überblick, Finanzen, Verlauf, nichts Internes', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-geh="kunden"]');
  await page.click('[data-akte="beispiel"]');
  await expect(page.locator('#reiter button')).toHaveCount(5);
  await page.click('#kundensicht');
  await expect(page.locator('#reiter button')).toHaveCount(3);
  await expect(page.locator('#neuer-termin')).toHaveCount(0);
  await expect(page.locator('.bilanz')).toContainText('bei euch');
  await expect(page.locator('.profil')).not.toContainText('@');
});

test('Abhaken in den Aufgaben schreibt das Thema in der Akte fort', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-geh="aufgaben"]');
  const p = page.locator('.aufgabe', { hasText: 'Tom Probe' }).locator('[data-ab]').first();
  await p.click();
  await expect(p).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#toast')).toContainText('Hausrat bei Tom: beim Kunden');
  await page.click('.aufgabe-kopf button:has-text("Tom Probe")');
  await page.click('[data-reiter="ueberblick"]');
  const hausrat = page.locator('.thema', { hasText: 'Hausrat' });
  await expect(hausrat.locator('.stand')).toHaveText('Beim Kunden');
  await page.click('[data-reiter="verlauf"]');
  await expect(page.locator('.verlauf')).toContainText('Hausrat: Vertrag vergleichen');
});

test('Thema in der Akte vormerken und Stand ändern', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-geh="kunden"]');
  await page.click('[data-akte="probe"]');
  await page.click('[data-thema-dazu="altersvorsorge"]');
  const av = page.locator('.thema', { hasText: 'Altersvorsorge' });
  await expect(av.locator('.stand')).toHaveText('Nächstes Mal');
  await av.locator('.thema-kopf').click();
  await av.locator('[data-thema-stand$="|mir"]').click();
  await expect(page.locator('.thema', { hasText: 'Altersvorsorge' }).locator('.stand')).toHaveText('Bei mir');
});

test('Neu laden behält die Änderungen im Tab', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-termin-oeffnen^="lea|"]');
  await page.fill('#mitschrift', '- Notiz bleibt');
  await expect(page.locator('#speicher-hinweis')).toHaveText('gespeichert');
  await page.reload();
  await page.click('[data-termin-oeffnen^="lea|"]');
  await expect(page.locator('#mitschrift')).toHaveValue('- Notiz bleibt');
});

for (const scheme of ['light', 'dark']) {
  test(`kein Querscrollen und keine Fehler (${scheme}) @mobil`, async ({ page }) => {
    const fehler = [];
    page.on('pageerror', e => fehler.push(e.message));
    await page.emulateMedia({ colorScheme: scheme });
    const doppelt = async (wo) => expect(await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map(e => e.id); return ids.filter((v, i) => ids.indexOf(v) !== i); }), wo).toEqual([]);
    const breit = async (wo) => { await doppelt(wo); expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), wo).toBeLessThanOrEqual(0); };
    const _alt = async (wo) => expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), wo).toBeLessThanOrEqual(0);
    await page.goto('/');
    await breit('heute');
    await page.click('[data-geh="kunden"]');
    await breit('kunden');
    await page.click('[data-akte="beispiel"]');
    for (const r of ['ueberblick', 'finanzen', 'termine', 'aufgaben', 'verlauf']) {
      await page.click(`#reiter [data-reiter="${r}"]`);
      await breit(r);
    }
    await page.click('[data-geh="aufgaben"]');
    await breit('aufgaben');
    await nachbereiteLea(page);
    await breit('nachbereiten');
    expect(fehler).toEqual([]);
  });
}
