# Zentrale (Repo `zentrale`)

Lukas' Zentrale für die Selbstständigkeit (FINPAL): Kunden, Themen aus den Beratungen und die Aufgaben daraus an einer
Stelle. Sprache in App, Code-Kommentaren und Commits: **Deutsch**.

## Ziel
- **Wofür:** Nach jedem Kundentermin wird jede Zusage zu einer Aufgabe, und beim Kunden steht nachvollziehbar, was
  besprochen, zugesagt und erledigt ist. Nichts geht verloren zwischen OneNote, Klar und Kalender.
- **Wer, wann:** Lukas (später vielleicht FINPAL-Kollegen). Direkt nach dem Termin am Rechner zum Nachbereiten;
  zwischendurch, um zu sehen, was bei wem offen ist; im Update-Termin zusammen mit dem Kunden („Mit … ansehen“).
- **Gelungen, wenn:** Lukas überträgt keine ToDos mehr von Hand aus OneNote nach Klar und Kalender, und im
  Update-Termin zeigt er dem Kunden auf einer Seite, was seit dem letzten Mal passiert ist.
- **Abgenommen:**
  - Idee Zentrale: Beratungen und Aufgaben an einer Stelle, Ansicht nach Kunden und nach Aufgaben (17.10.2026).
  - Am Ende des Termins werden ToDos vorgeschlagen und nach Bestätigung in Klar übernommen; daraus entsteht ein
    Verlauf je Kunde, der sich beim Abarbeiten fortschreibt (17.10.2026).
  - Inhalt aus der Finanzakte (Screenshot 17.10.2026): eine Aufgabe für Klar mit Unterpunkten, Mail an den Kunden mit
    „Bei mir / Bei dir“. Das Aussehen davon ausdrücklich nicht.
  - Klar bleibt die eine Aufgabenliste, die Zentrale schreibt hinein (17.10.2026).
  - Vorschläge für Aufgaben aus zwei Quellen: feste Schritte aus den Abläufen im Wiki an bestimmten Prozesspunkten,
    Claude ergänzt aus dem Freitext der Mitschrift (17.10.2026).
  - Zur Zentrale gehört: Kunden anlegen, eine Akte je Kunde, in der man mit dem Kunden reinschaut (Themen,
    Mitschriften, Verlauf, Aufgaben, Finanzen), Finanzdaten aufnehmen, Mitschriften und ToDos jederzeit pflegen,
    Klar eingebunden (17.10.2026, Rückmeldung zu Entwurf 1: „der gesamte Zentrale-Gedanke ist noch nicht da“).
- **Nicht gewollt:**
  - Eine zweite Aufgabenliste neben Klar.
  - Das Aussehen am Finanzakte-Screenshot ausrichten (17.10.2026: „ganz neu, Design soll das Ziel unterstützen,
    Themen verständlich vermitteln und erfragen“).
  - Zu viel Text und Zahlen auf einmal, unruhige Bewegung (Lehre aus der Finanzakte).
  - Vorerst: den Termin selbst in der App führen. Erst sinnvoll, wenn dort Beratung abgebildet werden kann. Bis dahin
    wird in OneNote mitgeschrieben und die Mitschrift beim Nachbereiten eingefügt.

## Verlauf der Entwürfe
- Entwurf 1 (17.10.2026): https://claude.ai/artifact/FagTHHJLxR3kJQt6Hbmov7. Themen statt Datumsliste: jedes Thema
  eines Kunden hat einen Stand (bei mir, beim Kunden, nächstes Mal, erledigt) und einen Faden. Nachbereiten fragt
  nacheinander: Mitschrift einfügen → Themen (aus der Mitschrift erkannt, offene von vorher vorausgewählt) → je Thema
  „Wer ist dran?“ → Ergebnis „Für Klar“ und „Mail an …“ → „In Klar übernehmen“.
  Rückmeldung: Aufgaben okay, aber es fehlt die Zentrale selbst (Kunde anlegen, Akte zum Reinschauen, Finanzen,
  Mitschriften, Klar eingebunden).
- Entwurf 2 (17.10.2026, gleicher Link): oben Heute · Kunden · Aufgaben. „Heute“: nachzubereitende Termine, wer über
  der Wiedervorlage wartet, nächste Termine. „Neuer Kunde“ (Name, Partner, Geburtsjahr, Tätigkeit, Kontakt). Die
  **Kundenakte** mit Reitern Überblick (Themen mit Stand und Faden, Stand von Hand änderbar, Thema vormerken; rechts
  als Nächstes, frei im Monat, offen in Klar), Finanzen (Einnahmen, vier Töpfe, Vermögen, Balken, frei im Monat;
  Änderungen landen im Verlauf), Termine (je Termin Mitschrift, jederzeit bearbeitbar, Status, Ergebnis), Aufgaben
  (die Klar-Aufgabe des Kunden, abhaken, eigene Punkte dazu), Verlauf. „Mit … ansehen“ zeigt nur Überblick,
  Finanzen und Verlauf. Nachbereiten startet am Termin. Im Tab gespeichert (sessionStorage), Klar gespielt.
  Wartet auf Lukas.

## Aufbau
- `index.html` – die ganze App. Erstes Script `<script id="kern">`: Daten (Kunde mit `themen`, `termine`, `finanzen`,
  `verlauf`; `aufgaben` = Klar-Aufgaben je Kunde), `WIKI` (Beispiel-Abläufe), `GRUPPEN` (Finanzen), Beträge lesen,
  Summen, Kunde und Termin anlegen, Themen erkennen, Aufgabe und Mail bauen, Übernehmen, Abhaken. Läuft auch in Node (`test/kern.spec.js`). Zweites Script: Oberfläche
  (Zustand `S`, `render()`, `go(seite)`). CSS in einem `<style>`-Block (Tokens → Grundlagen → Bausteine → Bereiche).
  Look nach Skill `app-ui`, Schrift Geist über Google Fonts.
- `scripts/` – `serve.mjs` (:5190), `check.mjs`, `artefakt.mjs <ziel>` (Fassung fürs Claude-Artifact).
- `test/` – `kern.spec.js`, `app.spec.js` (Rundgang Nachbereiten, Enter, Umstellen, Kundensicht, Abhaken, Handy, hell/dunkel).

## Befehle
- `npm test` – Fehlercheck + alle Tests, vor jedem Commit grün. Cloud-Sitzung: `PW_CHROMIUM=/opt/pw-browsers/chromium npm test`.
- `npm run dev` – http://localhost:5190.
- Entwurf zeigen: `node scripts/artefakt.mjs <scratchpad>/zentrale.html`, dann Artifact publish auf die URL oben.

## Regeln
- Repo **öffentlich**: keine Kundennamen, Mitschriften, Beträge. Testdaten erfunden (Lea Muster, Jonas und Mira
  Beispiel, Tom Probe, Sven Testmann). `check.mjs` lehnt Dokumente und Schlüssel ab.
- Kein Titelbalken oben links. Umschalter Kunden/Aufgaben oben in der Mitte.
- Stand eines Themas immer mit Wort, nie nur Farbe: bei mir = Flieder voll, beim Kunden = Flieder schraffiert,
  nächstes Mal = grau, erledigt = grün.
- Aufgaben nach den Klar-Regeln: eine Aufgabe je Kunde (`@Name`), Unterpunkte konkret, „Termin vereinbaren“ und
  „Termin vorbereiten“ (was, steht in der Notiz), wartet der Kunde: „Wartet auf …“ mit Wiedervorlage in 7 Tagen.
- In der Ansicht mit dem Kunden bleibt Internes weg: nur Überblick, Finanzen, Verlauf; keine Kontaktdaten, keine
  Klar-Einträge, kein „Neuer Termin“.
- Entwurf speichert nur im Tab (`sessionStorage`, Schlüssel `zentrale.entwurf.2`), „Beispiel neu laden“ unter „Entwurf“.
  Die echte Fassung speichert im Konto, nicht im Browser.

## Annahmen (Lukas vorlegen)
- Die Abläufe in `WIKI` sind Beispiele (Haftpflicht/Hausrat rechnen in PW oder Xempus, BU-Voranfrage, Altersvorsorge
  vorbereiten mit dem Investmentrechner). Die echten kommen aus dem Persönlichen Wiki.
- Abhaken des letzten eigenen Punkts eines Themas setzt es auf „beim Kunden“ (Angebot geschickt); erledigt der Kunde
  seinen Teil, geht es zurück zu Lukas (BU, Kfz) oder ist erledigt.
- Wiedervorlage für „Wartet auf …“: 7 Tage.
- Finanzen: frei = Einnahmen − (Wohnen und Verträge + Versicherungen + Leben + Sparen und Vorsorge). Vermögen getrennt,
  zählt nicht mit. Keine Bewertung, nur Zahlen.

## Weg (Stand 17.10.2026)
1. Klickbarer Entwurf mit erfundenen Daten (diese Fassung).
2. Konto: dieselbe Anmeldung wie Klar und Wiki (Supabase-Projekt von Klar). Aufgaben gehen in Klars `stand/aktuell`
   (Regeln dafür in `LULKASSS/klar`, CLAUDE.md), Abhaken in Klar schreibt das Thema fort, Abläufe aus `wiki/aktuell`.
   Claude-Ergänzung aus dem Freitext über einen kleinen Dienst bei Supabase mit API-Schlüssel (nicht in der Seite).
3. Finanzen beim Kunden (aus der Finanzakte nur, was abgenommen war).
4. Professional Works (Mails, Verträge), wenn die API geklärt ist.

## Offen für Lukas
- Datenschutz: Kunden-Finanzdaten bei Supabase (Frankfurt). AVV mit Supabase prüfen, Vorgaben von FINPAL klären.
  Vorher keine echten Kundendaten in die Zentrale.
- Wo liegt der Code der Finanzakte-Ansicht aus dem Screenshot? In `LULKASSS/finanzaufnahme` ist sie nicht (Stand 17.10.2026).
