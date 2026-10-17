// Browsertests: Rundgang Nachbereiten, Kundensicht, Abhaken, Handy ohne Querscrollen.
const { test, expect } = require('@playwright/test');

async function nachbereiteLea(page) {
  await page.goto('/');
  await page.click('[data-nachbereiten="lea"]');
  await page.click('#beispiel-mitschrift');
  await page.click('[data-weiter="0"]');
  await expect(page.locator('[data-thema-wahl]')).toHaveCount(6);
  await page.click('[data-weiter="1"]');
  for (let i = 2; i < 8; i++) await page.click(`[data-weiter="${i}"]`);
  await expect(page.locator('#ergebnis')).toBeVisible();
}

test('Termin nachbereiten: Thema für Thema, dann Klar und Mail @mobil', async ({ page }) => {
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  await nachbereiteLea(page);
  await expect(page.locator('.frage.zu')).toHaveCount(8);
  await expect(page.locator('#mailtext')).toHaveValue(/Bei dir:\n- BU: Kläre bitte/);
  await page.click('#uebernehmen');
  await expect(page.locator('h1')).toHaveText('Lea Muster');
  await expect(page.locator('.thema')).toHaveCount(6);
  await expect(page.locator('.verlauf li.neu').first()).toBeVisible();
  await expect(page.locator('#toast')).toContainText('In Klar');
  expect(fehler).toEqual([]);
});

test('Enter im Feld beantwortet die Frage und geht zum nächsten Thema', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-nachbereiten="lea"]');
  await page.click('#beispiel-mitschrift');
  await page.click('[data-weiter="0"]');
  await page.click('[data-weiter="1"]');
  await page.locator('[data-was="0"]').press('Enter');
  await expect(page.locator('.frage-innen h2')).toHaveText('Haftpflicht: Wer ist dran?');
  await expect(page.locator('[data-was="1"]')).toBeFocused();
});

test('Wer ist dran umstellen ändert Aufgabe und Mail', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-nachbereiten="lea"]');
  await page.click('#beispiel-mitschrift');
  await page.click('[data-weiter="0"]');
  await page.click('[data-weiter="1"]');
  await page.click('[data-weiter="2"]');
  await page.click('[data-stand="erledigt"][data-i="1"]');
  await page.fill('[data-was="1"]', 'Kein Bedarf, über den Vater versichert');
  for (let i = 3; i < 8; i++) await page.click(`[data-weiter="${i}"]`);
  await expect(page.locator('#ergebnis')).not.toContainText('Haftpflicht: Angebot rechnen');
  await expect(page.locator('#mailtext')).not.toHaveValue(/Haftpflicht/);
});

test('Ansicht mit dem Kunden blendet Internes aus', async ({ page }) => {
  await nachbereiteLea(page);
  await page.click('#uebernehmen');
  await expect(page.locator('.verlauf')).toContainText('In Klar übernommen');
  await page.click('#kundensicht');
  await expect(page.locator('.verlauf')).not.toContainText('In Klar übernommen');
  await expect(page.locator('[data-nachbereiten]')).toHaveCount(0);
  await expect(page.locator('.bilanz')).toContainText('bei dir');
});

test('Abhaken in den Aufgaben schreibt das Thema beim Kunden fort', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-geh="aufgaben"]');
  const p = page.locator('.aufgabe', { hasText: 'Tom Probe' }).locator('[data-ab]').first();
  await p.click();
  await expect(p).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#toast')).toContainText('Hausrat bei Tom: beim Kunden');
  await page.click('.aufgabe-kopf button:has-text("Tom Probe")');
  const hausrat = page.locator('.thema', { hasText: 'Hausrat' });
  await expect(hausrat.locator('.stand')).toHaveText('Beim Kunden');
  await expect(hausrat).toContainText('Vergleich geschickt');
});

test('Kundenliste zeigt, was drängt', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('1 Termin wartet aufs Nachbereiten');
  await expect(page.locator('.kzeile', { hasText: 'Jonas und Mira' })).toContainText('Wartet seit 15 Tagen');
});

for (const scheme of ['light', 'dark']) {
  test(`kein Querscrollen und keine Fehler (${scheme}) @mobil`, async ({ page }) => {
    const fehler = [];
    page.on('pageerror', e => fehler.push(e.message));
    await page.emulateMedia({ colorScheme: scheme });
    const breit = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.goto('/');
    await breit();
    await page.click('[data-kunde="beispiel"]');
    await breit();
    await page.click('[data-geh="aufgaben"]');
    await breit();
    await nachbereiteLea(page);
    await breit();
    expect(fehler).toEqual([]);
  });
}
