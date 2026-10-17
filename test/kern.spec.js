// Kern ohne Browser: Kunde, Termin, Finanzen, Themen erkennen, Aufgabe und Mail, Übernehmen, Abhaken.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const vm = require('vm');

function ladeKern() {
  const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  const code = html.match(/<script id="kern">([\s\S]*?)<\/script>/)[1];
  const ctx = { module: { exports: {} } };
  vm.runInNewContext(code, ctx);
  return ctx.module.exports;
}
const K = ladeKern();

function nachbereitet() {
  const S = K.beispielStand();
  const k = S.kunden.find(x => x.id === 'lea');
  const termin = k.termine[0];
  termin.mitschrift = K.BEISPIEL_MITSCHRIFT;
  const themen = K.erkenneThemen(termin.mitschrift).map((t, i) => ({ ...t, key: 'm' + i, was: t.was || K.vorschlagWas(t) }));
  const aufgabe = K.baueAufgabe(k, termin, themen);
  return { S, k, termin, themen, aufgabe };
}

test('Beträge: deutsch schreiben, Unsinn wird 0', () => {
  expect(K.leseBetrag('1.250')).toBe(1250);
  expect(K.leseBetrag('18,36')).toBe(18.36);
  expect(K.leseBetrag('1.250,50 €')).toBe(1250.5);
  expect(K.leseBetrag('')).toBe(0);
  expect(K.leseBetrag('abc')).toBe(0);
  expect(K.leseBetrag('-50')).toBe(0);
  expect(K.leseBetrag('1e12')).toBe(0);
  expect(K.euro(1234.5)).toBe('1.234,50 €');
  expect(K.euro(-120)).toBe('−120 €');
});

test('Finanzen: frei = Einnahmen minus vier Töpfe, Vermögen zählt nicht mit', () => {
  const S = K.beispielStand();
  const s = K.finanzSummen(S.kunden.find(x => x.id === 'lea').finanzen);
  expect(s.ein).toBe(3200);
  expect(s.aus).toBeCloseTo(2467.36, 2);
  expect(s.frei).toBeCloseTo(732.64, 2);
  expect(s.verm).toBe(10500);
  expect(K.finanzSummen(null).frei).toBe(0);
});

test('Kunde anlegen: Paar mit gemeinsamer Anrede, ohne Namen kein Kunde', () => {
  const S = K.beispielStand();
  expect(K.neuerKunde(S, { vorname: 'Anna', nachname: '' })).toBeNull();
  const k = K.neuerKunde(S, { vorname: 'Anna', nachname: 'Neu', partner: 'Ben', geburtsjahr: '1991', taetigkeit: 'Angestellt' });
  expect(k.name).toBe('Anna und Ben Neu');
  expect(k.vorname).toBe('Anna und Ben');
  expect(k.paar).toBe(true);
  expect(k.geburtsjahr).toBe(1991);
  expect(K.neuerKunde(S, { vorname: 'X', nachname: 'Y', geburtsjahr: 'abc' }).geburtsjahr).toBeNull();
});

test('Termin: heute offen, in der Zukunft geplant', () => {
  const S = K.beispielStand();
  const k = S.kunden.find(x => x.id === 'probe');
  expect(K.neuerTermin(k, 'Update-Termin', K.HEUTE).status).toBe('offen');
  expect(K.neuerTermin(k, 'Update-Termin', '2026-12-01').status).toBe('geplant');
  expect(K.offeneTermine(k).length).toBe(1);
});

test('erkennt die Themen der Beispiel-Mitschrift mit Vorschlag, wer dran ist', () => {
  const t = K.erkenneThemen(K.BEISPIEL_MITSCHRIFT);
  expect(t.map(x => x.name)).toEqual(['Finanzen', 'Haftpflicht', 'Hausrat', 'BU', 'Altersvorsorge', 'Steuerbescheid 2025']);
  expect(t.map(x => x.stand)).toEqual(['erledigt', 'mir', 'mir', 'kunde', 'naechstes', 'kunde']);
  expect(t[5].quelle).toBe('claude');
  expect(K.erkenneThemen('')).toEqual([]);
  expect(K.erkenneThemen('Kaffee getrunken\n\n')).toEqual([]);
});

test('eine Aufgabe je Kunde mit Wiki-Schritten, Wartet-Punkten, Mail und Termin', () => {
  const { aufgabe } = nachbereitet();
  expect(aufgabe.titel).toBe('@Lea Muster');
  const t = aufgabe.punkte.map(p => p.t);
  expect(t).toEqual(expect.arrayContaining(['Haftpflicht: Angebot rechnen', 'Gesundheitsfragen klären',
    'Steuerbescheid 2025 schicken', 'Mail verschicken', 'Termin vereinbaren', 'Termin vorbereiten']));
  expect(aufgabe.punkte.find(p => p.t === 'Gesundheitsfragen klären').wartetAuf).toBe('Lea');
  const vor = aufgabe.punkte.find(p => p.t === 'Termin vorbereiten');
  expect(vor.notiz).toBe('Vorbereiten: Altersvorsorge');
  expect(vor.schritte).toContain('Rentenlücke im Investmentrechner rechnen');
});

test('Mail: bei mir, bei dir, nächstes Mal, für Paare mit euch', () => {
  const { k, termin, themen } = nachbereitet();
  const m = K.baueMail(k, termin, themen);
  expect(m.startsWith('Hey Lea,')).toBe(true);
  expect(m).toContain('Bei mir:\n- Haftpflicht: Ich rechne dir ein Angebot und schicke es dir.');
  expect(m).toContain('Bei dir:\n- BU: Kläre bitte deine Gesundheitsfragen');
  expect(m).toContain('Nächstes Mal:\n- Altersvorsorge');
  const paar = K.beispielStand().kunden.find(x => x.paar);
  const mp = K.baueMail(paar, termin, [{ wiki: 'haftpflicht', name: 'Haftpflicht', stand: 'mir', was: 'Angebot rechnen' }]);
  expect(mp.startsWith('Hey Jonas, hey Mira,')).toBe(true);
  expect(mp).toContain('Ich rechne euch ein Angebot');
});

test('Übernehmen schließt den Termin ab, schreibt Themen, Verlauf und eine Aufgabe in Klar', () => {
  const { S, k, termin, themen, aufgabe } = nachbereitet();
  aufgabe.punkte.find(p => p.t === 'Mail gegenlesen lassen').an = false;
  const r = K.uebernehmen(S, 'lea', termin.id, themen, aufgabe);
  expect(r.punkte).toBe(aufgabe.punkte.length - 1);
  expect(termin.status).toBe('nachbereitet');
  expect(termin.ergebnis.length).toBe(6);
  expect(K.offeneTermine(k)).toEqual([]);
  expect(k.themen.length).toBe(6);
  expect(k.verlauf.some(v => v.art === 'termin' && v.text === 'Erstgespräch')).toBe(true);
  const a = S.aufgaben.find(x => x.kunde === 'lea');
  expect(S.aufgaben.filter(x => x.kunde === 'lea').length).toBe(1);
  expect(a.titel).toBe('@Lea Muster');
  expect(a.punkte.find(p => p.t === 'Gesundheitsfragen klären').warten).toEqual({ art: 'kunde', seit: K.HEUTE, nachgefragt: [] });
  expect(a.punkte.find(p => p.t === 'Haftpflicht: Angebot rechnen').notiz).toContain('Ablauf (Wiki): Rechnen');
  expect(a.verlauf.at(-1).text).toMatch(/^Aus der Zentrale: Erstgespräch 17.10.2026 nachbereitet, \d+ Punkte\.$/);
});

test('Update-Termin hängt an die bestehende Aufgabe und das bestehende Thema an', () => {
  const S = K.beispielStand();
  const k = S.kunden.find(x => x.id === 'beispiel');
  const tm = K.neuerTermin(k, 'Update-Termin', K.HEUTE);
  const bu = k.themen.find(t => t.name === 'BU');
  const vorher = S.aufgaben.find(a => a.kunde === 'beispiel').punkte.length;
  const themen = [{ key: 'b1', bestand: bu.id, wiki: 'bu', name: 'BU', stand: 'mir', was: 'Voranfrage stellen' }];
  K.uebernehmen(S, 'beispiel', tm.id, themen, K.baueAufgabe(k, tm, themen));
  expect(S.aufgaben.filter(a => a.kunde === 'beispiel').length).toBe(1);
  expect(S.aufgaben.find(a => a.kunde === 'beispiel').punkte.length).toBeGreaterThan(vorher);
  expect(k.themen.filter(t => t.name === 'BU').length).toBe(1);
  expect(bu.stand).toBe('mir');
  expect(bu.faden.length).toBe(2);
});

test('Aufgaben haben Klars Form', () => {
  const S = K.beispielStand();
  const a = S.aufgaben.find(x => x.kunde === 'beispiel');
  for (const f of ['id', 'titel', 'cluster', 'prio', 'faellig', 'status', 'erstellt', 'erledigtAm', 'notiz', 'punkte', 'verlauf', 'wiederholung']) expect(a).toHaveProperty(f);
  for (const f of ['id', 't', 'ok', 'st', 'loesung', 'notiz']) expect(a.punkte[0]).toHaveProperty(f);
  expect(a.verlauf[0]).toEqual(expect.objectContaining({ am: expect.any(String), text: expect.any(String), art: 'auto' }));
  expect(a.punkte.find(p => p.t === 'Gesundheitsfragen klären').warten).toEqual({ art: 'kunde', seit: '2026-10-02', nachgefragt: ['2026-10-06'] });
});

test('Eigener Punkt landet in der Klar-Aufgabe des Kunden, leer gibt es nicht', () => {
  const S = K.beispielStand();
  expect(K.neuerPunkt(S, 'test', '  ')).toBeNull();
  K.neuerPunkt(S, 'test', 'Kfz-Kündigung vorbereiten');
  const a = S.aufgaben.find(x => x.kunde === 'test');
  expect(a.titel).toBe('@Sven Testmann');
  expect(a.punkte.map(p => p.t)).toEqual(['Kfz-Kündigung vorbereiten']);
  expect(a.verlauf[0].text).toBe('Aufgabe angelegt.');
});

test('Stand von Hand ändern schreibt den Faden fort', () => {
  const S = K.beispielStand();
  const k = S.kunden.find(x => x.id === 'beispiel');
  const kfz = k.themen.find(t => t.name === 'Kfz');
  expect(K.setzeThemaStand(k, kfz.id, 'naechstes', K.HEUTE)).toBeNull();
  K.setzeThemaStand(k, kfz.id, 'mir', K.HEUTE);
  expect(kfz.stand).toBe('mir');
  expect(kfz.faden.at(-1).text).toBe('Bei mir');
});

test('Punkt wie in Klar: offen → läuft → erledigt → offen, Verlauf, Thema und Akte ziehen nach', () => {
  const S = K.beispielStand();
  const a = S.aufgaben.find(x => x.kunde === 'probe');
  const k = S.kunden.find(x => x.id === 'probe');
  const p = a.punkte.find(x => x.t.startsWith('Hausrat'));
  const th = k.themen.find(t => t.name === 'Hausrat');
  const am = '2026-10-17T09:00:00.000Z';
  expect(K.naechsterPunktStand(p)).toBe('laeuft');
  K.setzePunktStand(S, a.id, p.id, 'laeuft', am);
  expect(a.verlauf.at(-1).text).toBe('Hausrat: Vertrag vergleichen — angefangen.');
  p.loesung = 'Neuer Tarif 20 % günstiger';
  K.setzePunktStand(S, a.id, p.id, 'fertig', am);
  expect(p.ok).toBe(true);
  expect(a.verlauf.at(-1)).toEqual(expect.objectContaining({ pid: p.id, pfertig: true, text: 'Hausrat: Vertrag vergleichen — erledigt. Lösung: Neuer Tarif 20 % günstiger' }));
  expect(th.stand).toBe('kunde');
  expect(th.was).toBe('Vergleich geschickt');
  expect(k.verlauf.at(-1).d).toBe('2026-10-17');
  const nVerlauf = a.verlauf.length;
  K.setzePunktStand(S, a.id, p.id, 'offen', am);
  expect(th.stand).toBe('mir');
  expect(th.faden.length).toBe(1);
  expect(a.verlauf.length).toBe(nVerlauf - 1);
});

test('Warten wie in Klar: nachfragen nach 3, 7, 14, 21 Tagen, Antwort kam gibt das Thema zurück', () => {
  const S = K.beispielStand();
  const a = S.aufgaben.find(x => x.kunde === 'probe');
  const p = a.punkte.find(x => x.warten);
  expect(K.lageWarten({ seit: '2026-10-10', nachgefragt: [] }, '2026-10-12').dran).toBe(false);
  expect(K.lageWarten({ seit: '2026-10-10', nachgefragt: [] }, '2026-10-13').dran).toBe(true);
  expect(K.lageWarten({ seit: '2026-10-10', nachgefragt: ['2026-10-13'] }, '2026-10-17').naechst).toBe('2026-10-17');
  expect(K.lageWarten(p.warten, K.HEUTE)).toEqual(expect.objectContaining({ dran: true, alter: 22, n: 2 }));
  K.nachgefragt(S, a.id, p.id, K.HEUTE);
  expect(K.lageWarten(p.warten, K.HEUTE).dran).toBe(false);
  const kfz = S.kunden.find(x => x.id === 'probe').themen.find(t => t.name === 'Kfz');
  K.antwortKam(S, a.id, p.id, K.HEUTE);
  expect(p.warten).toBeNull();
  expect(kfz.stand).toBe('mir');
  expect(kfz.was).toBe('Angebot rechnen');
  expect(a.verlauf.at(-1).text).toBe('Antwort kam (Kunde): Fahrzeugschein schicken');
});

test('Festhalten und Abhaken schreiben den Verlauf der Aufgabe', () => {
  const S = K.beispielStand();
  const a = S.aufgaben.find(x => x.kunde === 'beispiel');
  expect(K.festhalten(S, a.id, '  ')).toBeNull();
  const e = K.festhalten(S, a.id, 'Mira angerufen', a.punkte[3].id, '2026-10-17T10:00:00.000Z');
  expect(e).toEqual(expect.objectContaining({ art: 'hand', pid: a.punkte[3].id, text: 'Mira angerufen' }));
  K.aufgabeAbhaken(S, a.id, true, '2026-10-17T11:00:00.000Z');
  expect(a.status).toBe('erledigt');
  expect(a.erledigtAm).toBe('2026-10-17T11:00:00.000Z');
  K.aufgabeAbhaken(S, a.id, false);
  expect(a.status).toBe('offen');
});
