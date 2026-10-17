// Echte Fassung mit Konto. Supabase wird nachgebaut (wie in Klars test/wolke.spec.js): ein Speicher im
// Testprozess mit derselben Tabelle klar_dokumente. Geprüft wird, dass die Zentrale Klars stand/aktuell
// richtig liest und schreibt, Fremdes nicht anfasst, vorher sichert und gleichzeitige Änderungen zusammenführt.
const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

const NUTZER = 'u-lukastestde';
const KLAR_ALT = '2026-10-10T10:00:00.000Z';

function klarStand(aufgaben) {
  return { fassung: 12, eintraege: [], aufgaben, cluster: ['Privat'], mitschriften: [{ id: 'm1', titel: 'Wochenmeeting', zeilen: [] }], reihen: [], vorschlaege: [], lagebericht: null, lernen: null, zuletzt: KLAR_ALT };
}
function klarAufgabe(id, titel, punkte) {
  return { id, titel, cluster: 'Privat', prio: 2, faellig: null, status: 'offen', erstellt: KLAR_ALT, erledigtAm: '', notiz: '',
    punkte: punkte.map((t, i) => ({ id: id + '-p' + i, t, ok: false, st: 'offen', loesung: null, notiz: null })), verlauf: [], wiederholung: null };
}

function speicher() {
  const zeilen = new Map(), seiten = [], haken = { vorUpdate: null };
  const nutzer = new Map([['lukas@test.de', 'geheim123']]);
  const schluessel = r => `${r.user_id}|${r.sammlung}|${r.id}`;
  const passt = f => r => f.every(([k, v]) => (k === 'daten->>zuletzt' ? (r.daten && r.daten.zuletzt) === v : r[k] === v));
  async function melden(e) { for (const p of seiten) await p.evaluate(x => window.__zentraleRT && window.__zentraleRT(x), e).catch(() => {}); }
  async function db(st) {
    const liste = () => [...zeilen.values()].filter(passt(st.filters));
    if (st.op === 'upsert') { zeilen.set(schluessel(st.row), st.row); await melden({ new: st.row }); return { data: null, error: null }; }
    if (st.op === 'insert') {
      if (zeilen.has(schluessel(st.row))) return { data: null, error: { message: 'duplicate key' } };
      zeilen.set(schluessel(st.row), st.row); await melden({ new: st.row }); return { data: [{ id: st.row.id }], error: null };
    }
    if (st.op === 'update') {
      if (haken.vorUpdate) { const h = haken.vorUpdate; haken.vorUpdate = null; await h(); }
      const treffer = liste();
      treffer.forEach(r => Object.assign(r, st.patch));
      for (const r of treffer) await melden({ new: r });
      return { data: treffer.map(r => ({ id: r.id })), error: null };
    }
    if (st.op === 'delete') { liste().forEach(r => zeilen.delete(schluessel(r))); return { data: null, error: null }; }
    const l = liste();
    if (st.single) return { data: l[0] ? { daten: l[0].daten } : null, error: null };
    return { data: l.map(r => ({ id: r.id, daten: r.daten })), error: null };
  }
  function auth(mail, pw) {
    if (nutzer.get(mail) !== pw) return { error: { message: 'Invalid login credentials' } };
    return { user: { id: 'u-' + mail.replace(/\W/g, ''), email: mail } };
  }
  async function geraet(browser) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    await ctx.exposeBinding('__zDb', (_q, st) => db(JSON.parse(st)));
    await ctx.exposeBinding('__zAuth', (_q, mail, pw) => auth(mail, pw));
    await ctx.addInitScript(() => {
      function abfrage() {
        const st = { op: 'select', filters: [], single: false, row: null, patch: null };
        const b = {
          select() { return b; }, upsert(row) { st.op = 'upsert'; st.row = row; return b; }, insert(row) { st.op = 'insert'; st.row = row; return b; },
          update(p) { st.op = 'update'; st.patch = p; return b; }, delete() { st.op = 'delete'; return b; },
          eq(k, v) { st.filters.push([k, v]); return b; }, order() { return b; }, limit() { return b; }, maybeSingle() { st.single = true; return b; },
          then(ok, nein) { return window.__zDb(JSON.stringify(st)).then(ok, nein); }
        };
        return b;
      }
      const sitzung = () => { try { return JSON.parse(localStorage.getItem('test.sitzung')); } catch { return null; } };
      window.__zentraleSupabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({ data: { session: sitzung() } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
            signInWithPassword: async ({ email, password }) => {
              const r = await window.__zAuth(email, password);
              if (r.error) return { data: {}, error: r.error };
              localStorage.setItem('test.sitzung', JSON.stringify({ user: r.user }));
              return { data: { user: r.user, session: { user: r.user } }, error: null };
            },
            signOut: async () => { localStorage.removeItem('test.sitzung'); return {}; }
          },
          from: () => abfrage(),
          channel: () => { const k = { on(_t, _f, cb) { window.__zentraleRT = cb; return k; }, subscribe() { return k; } }; return k; },
          removeChannel: () => { window.__zentraleRT = null; }
        })
      };
    });
    const page = await ctx.newPage();
    const fehler = [];
    page.on('pageerror', e => fehler.push(e.message));
    seiten.push(page);
    await page.goto('/konto');
    return { page, ctx, fehler };
  }
  const row = (sammlung, id) => zeilen.get(`${NUTZER}|${sammlung}|${id}`);
  const klar = () => JSON.parse(row('stand', 'aktuell').daten.stand);
  return { zeilen, geraet, haken, row, klar, melden };
}

async function anmelden(page) {
  await expect(page.locator('#tor-form')).toBeVisible();
  await page.fill('#tor-mail', 'lukas@test.de');
  await page.fill('#tor-pw', 'falsch');
  await page.click('#tor-form [type="submit"]');
  await expect(page.locator('.tor-meldung')).toHaveText('E-Mail oder Passwort stimmt nicht.');
  await page.fill('#tor-pw', 'geheim123');
  await page.click('#tor-form [type="submit"]');
  await expect(page.locator('#tor-form')).toHaveCount(0);
}
async function kundeAnlegen(page, vor, nach) {
  await page.click('[data-geh="kunden"]');
  await page.click('[data-geh="neu"]');
  await page.fill('#nk-vorname', vor);
  await page.fill('#nk-nachname', nach);
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toHaveText(vor + ' ' + nach);
}
const gespeichert = page => expect(page.locator('#entwurf-knopf')).toHaveAttribute('data-status', 'gespeichert', { timeout: 10_000 });

test('Anmelden mit dem Klar-Konto, Kunde anlegen, bleibt nach Neuladen', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mac', 'baut sein Gerät selbst');
  const s = speicher();
  const { page, ctx, fehler } = await s.geraet(browser);
  await anmelden(page);
  await expect(page.locator('#entwurf-knopf')).toHaveText('Konto');
  await kundeAnlegen(page, 'Anna', 'Neu');
  await gespeichert(page);
  const z = JSON.parse(s.row('zentrale', 'aktuell').daten.stand);
  expect(z.kunden.map(k => k.name)).toEqual(['Anna Neu']);
  expect(s.row('stand', 'aktuell')).toBeUndefined();
  await page.reload();
  await page.click('[data-geh="kunden"]');
  await expect(page.locator('.lzeile')).toContainText('Anna Neu');
  expect([...s.zeilen.values()].every(r => r.user_id === NUTZER)).toBe(true);
  expect(fehler).toEqual([]);
  await ctx.close();
});

test('Klar-Aufgabe „@Name“ erscheint beim Kunden; Abhaken schreibt nur sie in Klar, mit Sicherung vorher', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mac', 'baut sein Gerät selbst');
  const s = speicher();
  const fremd = klarAufgabe('k1', 'Steuererklärung machen', ['Belege sammeln']);
  const kunde = klarAufgabe('k2', '@Anna Neu', ['Unterlagen anfordern', 'Angebot rechnen']);
  s.zeilen.set(`${NUTZER}|stand|aktuell`, { user_id: NUTZER, sammlung: 'stand', id: 'aktuell', daten: { stand: JSON.stringify(klarStand([fremd, kunde])), zuletzt: KLAR_ALT, geraet: 'mac', geraetname: 'Mac', aufgaben: 2 } });
  const { page, ctx, fehler } = await s.geraet(browser);
  await anmelden(page);
  await kundeAnlegen(page, 'Anna', 'Neu');
  await page.click('#reiter [data-reiter="aufgaben"]');
  await expect(page.locator('.punkt-feld[value="Unterlagen anfordern"]')).toHaveCount(1);
  await page.locator('.kpunkt[data-pid="k2-p0"] .haken').click();
  await page.locator('.kpunkt[data-pid="k2-p0"] .haken').click();
  await gespeichert(page);

  const d = s.row('stand', 'aktuell').daten, z = s.klar();
  expect(d.geraet).toBe('zentrale');
  expect(z.zuletzt).toBe(d.zuletzt);
  expect(z.aufgaben.find(a => a.id === 'k1')).toEqual(fremd);
  expect(z.mitschriften).toEqual([{ id: 'm1', titel: 'Wochenmeeting', zeilen: [] }]);
  const a = z.aufgaben.find(x => x.id === 'k2');
  expect(a.punkte[0]).toEqual(expect.objectContaining({ st: 'fertig', ok: true }));
  expect(a.kunde).toBe(JSON.parse(s.row('zentrale', 'aktuell').daten.stand).kunden[0].id);
  expect(a.verlauf.some(v => v.text === 'Unterlagen anfordern — erledigt.' && v.pfertig)).toBe(true);
  const sich = [...s.zeilen.values()].filter(r => r.sammlung === 'sicherungen');
  expect(sich.length).toBe(1);
  expect(sich[0].daten.grund).toBe('vor Zentrale');
  expect(JSON.parse(sich[0].daten.stand).aufgaben.find(x => x.id === 'k2').punkte[0].st).toBe('offen');
  expect(fehler).toEqual([]);
  await ctx.close();
});

test('Nachbereiten legt die Aufgabe in Klar an; Änderungen aus Klar kommen live herein', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mac', 'baut sein Gerät selbst');
  const s = speicher();
  s.zeilen.set(`${NUTZER}|stand|aktuell`, { user_id: NUTZER, sammlung: 'stand', id: 'aktuell', daten: { stand: JSON.stringify(klarStand([klarAufgabe('k1', 'Wochenplanung', ['Kalender'])])), zuletzt: KLAR_ALT, geraet: 'mac', geraetname: 'Mac', aufgaben: 1 } });
  const { page, ctx, fehler } = await s.geraet(browser);
  await anmelden(page);
  await kundeAnlegen(page, 'Ben', 'Test');
  await page.click('#neuer-termin');
  await page.click('#nt-anlegen');
  await page.fill('#mitschrift', '- Haftpflicht fehlt -> rechnen\n- nächstes Mal Altersvorsorge');
  await page.click('[data-nachbereiten]');
  await page.click('[data-weiter="0"]');
  await page.click('[data-weiter="1"]');
  await page.click('[data-weiter="2"]');
  await page.click('[data-weiter="3"]');
  await page.click('#uebernehmen');
  await gespeichert(page);
  let z = s.klar();
  const a = z.aufgaben.find(x => x.titel === '@Ben Test');
  expect(a.punkte.map(p => p.t)).toEqual(expect.arrayContaining(['Haftpflicht: Angebot rechnen', 'Mail verschicken', 'Termin vereinbaren']));
  expect(a.cluster).toBe('Kunden');
  expect(z.cluster).toContain('Kunden');
  expect(z.aufgaben.find(x => x.id === 'k1').titel).toBe('Wochenplanung');

  /* In Klar wird ein Punkt erledigt und einer dazugeschrieben (wie es die Klar-App tut) */
  const r = s.row('stand', 'aktuell');
  z = JSON.parse(r.daten.stand);
  const ka = z.aufgaben.find(x => x.id === a.id);
  ka.punkte[0].st = 'fertig'; ka.punkte[0].ok = true;
  ka.punkte.push({ id: 'aus-klar', t: 'In Klar ergänzt', ok: false, st: 'offen', loesung: null, notiz: null });
  z.zuletzt = new Date().toISOString();
  r.daten = { ...r.daten, stand: JSON.stringify(z), zuletzt: z.zuletzt, geraet: 'mac', geraetname: 'Mac' };
  await s.melden({ new: r });
  await page.click('#reiter [data-reiter="aufgaben"]');
  await expect(page.locator('.punkt-feld[value="In Klar ergänzt"]')).toHaveCount(1);
  await expect(page.locator('.kpunkte.erledigt')).toContainText('Haftpflicht: Angebot rechnen');
  expect(fehler).toEqual([]);
  await ctx.close();
});

test('Klar speichert genau gleichzeitig: nichts geht verloren', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mac', 'baut sein Gerät selbst');
  const s = speicher();
  s.zeilen.set(`${NUTZER}|stand|aktuell`, { user_id: NUTZER, sammlung: 'stand', id: 'aktuell', daten: { stand: JSON.stringify(klarStand([klarAufgabe('k2', '@Anna Neu', ['Eins', 'Zwei'])])), zuletzt: KLAR_ALT, geraet: 'mac', geraetname: 'Mac', aufgaben: 1 } });
  const { page, ctx, fehler } = await s.geraet(browser);
  await anmelden(page);
  await kundeAnlegen(page, 'Anna', 'Neu');
  await gespeichert(page);
  /* Kurz bevor die Zentrale schreibt, speichert Klar: Punkt „Zwei“ bekommt eine Notiz, eine neue Aufgabe kommt dazu */
  s.haken.vorUpdate = async () => {
    const r = s.row('stand', 'aktuell'), z = JSON.parse(r.daten.stand);
    z.aufgaben[0].punkte[1].notiz = 'Notiz aus Klar';
    z.aufgaben.push(klarAufgabe('k3', 'Neu in Klar', ['x']));
    z.zuletzt = '2026-10-20T08:00:00.000Z';
    r.daten = { ...r.daten, stand: JSON.stringify(z), zuletzt: z.zuletzt, geraet: 'mac' };
  };
  await page.click('#reiter [data-reiter="aufgaben"]');
  await page.locator('.kpunkt[data-pid="k2-p0"] .haken').click();
  await gespeichert(page);
  const z = s.klar(), a = z.aufgaben.find(x => x.id === 'k2');
  expect(a.punkte[0].st).toBe('laeuft');
  expect(a.punkte[1].notiz).toBe('Notiz aus Klar');
  expect(z.aufgaben.map(x => x.id)).toEqual(['k2', 'k3']);
  expect(fehler).toEqual([]);
  await ctx.close();
});

test('Klar überschreibt mit älterem Stand (dort war Arbeit offen): die Zentrale schreibt nochmal', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mac', 'baut sein Gerät selbst');
  const s = speicher();
  s.zeilen.set(`${NUTZER}|stand|aktuell`, { user_id: NUTZER, sammlung: 'stand', id: 'aktuell', daten: { stand: JSON.stringify(klarStand([klarAufgabe('k2', '@Anna Neu', ['Eins'])])), zuletzt: KLAR_ALT, geraet: 'mac', geraetname: 'Mac', aufgaben: 1 } });
  const { page, ctx, fehler } = await s.geraet(browser);
  await anmelden(page);
  await kundeAnlegen(page, 'Anna', 'Neu');
  await gespeichert(page);
  const vorher = JSON.parse(JSON.stringify(s.row('stand', 'aktuell').daten));
  await page.click('#reiter [data-reiter="aufgaben"]');
  await page.locator('[data-neupunkt]').fill('Neu aus der Zentrale');
  await page.locator('[data-neupunkt]').press('Enter');
  await gespeichert(page);
  expect(s.klar().aufgaben[0].punkte.map(p => p.t)).toContain('Neu aus der Zentrale');
  /* Klar hatte eigene Arbeit offen und schreibt seinen älteren Stand mit neuer Uhrzeit drüber */
  const r = s.row('stand', 'aktuell'), z = JSON.parse(vorher.stand);
  z.zuletzt = new Date(Date.now() + 1000).toISOString();
  r.daten = { ...vorher, stand: JSON.stringify(z), zuletzt: z.zuletzt, geraet: 'mac' };
  await s.melden({ new: r });
  await expect.poll(() => s.klar().aufgaben[0].punkte.map(p => p.t), { timeout: 10_000 }).toContain('Neu aus der Zentrale');
  await expect(page.locator('.punkt-feld[value="Neu aus der Zentrale"]')).toHaveCount(1);
  expect(fehler).toEqual([]);
  await ctx.close();
});
