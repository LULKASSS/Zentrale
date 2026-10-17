// Kern ohne Browser: Themen erkennen, Aufgabe und Mail bauen, Übernehmen, Abhaken.
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
  const termin = { art: 'Erstgespräch', d: K.HEUTE };
  const themen = K.erkenneThemen(K.BEISPIEL_MITSCHRIFT).map((t, i) => ({ ...t, key: 'm' + i, was: t.was || K.vorschlagWas(t) }));
  const aufgabe = K.baueAufgabe(k, termin, themen);
  return { S, k, termin, themen, aufgabe };
}

test('erkennt die Themen der Beispiel-Mitschrift mit Vorschlag, wer dran ist', () => {
  const t = K.erkenneThemen(K.BEISPIEL_MITSCHRIFT);
  expect(t.map(x => x.name)).toEqual(['Finanzen', 'Haftpflicht', 'Hausrat', 'BU', 'Altersvorsorge', 'Steuerbescheid 2025']);
  expect(t.map(x => x.stand)).toEqual(['erledigt', 'mir', 'mir', 'kunde', 'naechstes', 'kunde']);
  expect(t[5].quelle).toBe('claude');
});

test('leere oder unsinnige Mitschrift ergibt keine Themen', () => {
  expect(K.erkenneThemen('')).toEqual([]);
  expect(K.erkenneThemen(null)).toEqual([]);
  expect(K.erkenneThemen('Kaffee getrunken\n\n')).toEqual([]);
});

test('eine Aufgabe je Kunde mit Wiki-Schritten, Wartet-Punkten, Mail und Termin', () => {
  const { aufgabe } = nachbereitet();
  expect(aufgabe.titel).toBe('@Lea Muster');
  const t = aufgabe.punkte.map(p => p.t);
  expect(t).toContain('Haftpflicht: Angebot rechnen');
  expect(t).toContain('Wartet auf Lea: Gesundheitsfragen klären');
  expect(t).toContain('Wartet auf Lea: Steuerbescheid 2025 schicken');
  expect(t).toContain('Mail verschicken');
  expect(t).toContain('Termin vereinbaren');
  const vor = aufgabe.punkte.find(p => p.t === 'Termin vorbereiten');
  expect(vor.notiz).toBe('Vorbereiten: Altersvorsorge');
  expect(vor.schritte).toContain('Rentenlücke im Investmentrechner rechnen');
  expect(aufgabe.punkte.find(p => p.t.startsWith('Haftpflicht')).schritte.length).toBe(3);
});

test('Mail: bei mir, bei dir, nächstes Mal, für Paare mit euch', () => {
  const { k, termin, themen } = nachbereitet();
  const m = K.baueMail(k, termin, themen);
  expect(m.startsWith('Hey Lea,')).toBe(true);
  expect(m).toContain('Bei mir:\n- Haftpflicht: Ich rechne dir ein Angebot und schicke es dir.');
  expect(m).toContain('Bei dir:\n- BU: Kläre bitte deine Gesundheitsfragen');
  expect(m).toContain('Nächstes Mal:\n- Altersvorsorge');
  expect(m.trim().endsWith('Lukas')).toBe(true);
  const paar = K.beispielStand().kunden.find(x => x.paar);
  const mp = K.baueMail(paar, termin, [{ wiki: 'haftpflicht', name: 'Haftpflicht', stand: 'mir', was: 'Angebot rechnen' }]);
  expect(mp.startsWith('Hey Jonas, hey Mira,')).toBe(true);
  expect(mp).toContain('Ich rechne euch ein Angebot');
  expect(mp).toContain('meldet euch');
});

test('Übernehmen schreibt Themen, Verlauf und genau eine Aufgabe in Klar', () => {
  const { S, k, termin, themen, aufgabe } = nachbereitet();
  aufgabe.punkte.find(p => p.t === 'Mail gegenlesen lassen').an = false;
  const r = K.uebernehmen(S, 'lea', termin, themen, aufgabe);
  expect(r.punkte).toBe(aufgabe.punkte.length - 1);
  expect(k.offenerTermin).toBeNull();
  expect(k.themen.length).toBe(6);
  expect(k.verlauf.some(v => v.art === 'termin' && v.text === 'Erstgespräch')).toBe(true);
  expect(S.aufgaben.filter(a => a.kunde === 'lea').length).toBe(1);
  expect(S.aufgaben.find(a => a.kunde === 'lea').punkte.some(p => p.t === 'Mail gegenlesen lassen')).toBe(false);
});

test('Update-Termin hängt an die bestehende Aufgabe und das bestehende Thema an', () => {
  const S = K.beispielStand();
  const k = S.kunden.find(x => x.id === 'beispiel');
  const bu = k.themen.find(t => t.name === 'BU');
  const vorher = S.aufgaben.find(a => a.kunde === 'beispiel').punkte.length;
  const themen = [{ key: 'b1', bestand: bu.id, wiki: 'bu', name: 'BU', stand: 'mir', was: 'Voranfrage stellen' }];
  const aufgabe = K.baueAufgabe(k, { art: 'Update-Termin', d: K.HEUTE }, themen);
  K.uebernehmen(S, 'beispiel', { art: 'Update-Termin', d: K.HEUTE }, themen, aufgabe);
  expect(S.aufgaben.filter(a => a.kunde === 'beispiel').length).toBe(1);
  expect(S.aufgaben.find(a => a.kunde === 'beispiel').punkte.length).toBeGreaterThan(vorher);
  expect(k.themen.filter(t => t.name === 'BU').length).toBe(1);
  expect(bu.stand).toBe('mir');
  expect(bu.faden.length).toBe(2);
});

test('Abhaken schreibt den Faden fort, Zurücknehmen stellt alles wieder her', () => {
  const S = K.beispielStand();
  const a = S.aufgaben.find(x => x.kunde === 'probe');
  const k = S.kunden.find(x => x.id === 'probe');
  const p = a.punkte.find(x => x.t.startsWith('Hausrat'));
  const th = k.themen.find(t => t.name === 'Hausrat');
  K.abhaken(S, a.id, p.id, true, K.HEUTE);
  expect(th.stand).toBe('kunde');
  expect(th.was).toBe('Vergleich geschickt');
  expect(th.faden.at(-1).text).toBe('Vertrag verglichen und geschickt');
  K.abhaken(S, a.id, p.id, false, K.HEUTE);
  expect(th.stand).toBe('mir');
  expect(th.faden.length).toBe(1);
  const w = a.punkte.find(x => x.art === 'kunde');
  const kfz = k.themen.find(t => t.name === 'Kfz');
  K.abhaken(S, a.id, w.id, true, K.HEUTE);
  expect(kfz.stand).toBe('mir');
  expect(kfz.faden.at(-1).text).toBe('Fahrzeugschein schicken: erledigt');
});
