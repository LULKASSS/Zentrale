# Zentrale (Repo `zentrale`)

Lukas' Zentrale für die Selbstständigkeit (FINPAL): Kunden, Themen aus den Beratungen und die Aufgaben daraus an einer
Stelle. Sprache in App, Code-Kommentaren und Commits: **Deutsch**.

- **Echte Fassung:** https://lulkasss.github.io/Zentrale/ (GitHub Pages aus `main`, Anmeldung mit dem Klar-Konto).
  Seit 17.10.2026; Lukas startet mit Testkunden.
- **Entwurf mit erfundenen Kunden:** https://claude.ai/artifact/FagTHHJLxR3kJQt6Hbmov7 (dieselbe `index.html` ohne Konto).

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
  - Entwurf 2: „viel bessere Zentrale“. Im Überblick sehen, wie viel frei im Monat ist, die offenen Themen, den
    Verlauf (17.10.2026).
  - Der Überblick ist die Landingpage je Kunde, mit der man im Termin nachvollzieht, was offen ist und was passiert
    ist; dort ein Blickfang, der die Themen zeigt (17.10.2026).
  - Alles andere klein und dicht: wo man nur sehen muss, was ansteht, nehmen Elemente wenig Platz ein (17.10.2026).
  - Entwurf 3 „schon sehr cool, sieht richtig nach was aus“: Landingpage mit Ring und Fahrplan, die dichte Fassung
    (17.10.2026).
  - Aufgaben genau wie in Klar aufgebaut, mit derselben Bedienung, damit man sich wiederfindet: Aufgabe,
    Unterpunkte, Notiz, Lösung, Warten, Verlauf, Festhalten (17.10.2026).
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
  Rückmeldung: viel besser; Landingpage je Kunde für den Termin, Elemente kleiner, im Überblick ein Blickfang.
- Entwurf 3 (17.10.2026, gleicher Link): alle Maße kleiner (siehe Regeln). Überblick = Landingpage: oben Ring
  (Themen nach Stand, „2/5 erledigt“) und **Fahrplan** (je Thema eine Spur über die Zeit, Punkte = Schritte im
  Faden, Termine als gestrichelte Linien, heute in Flieder, offene Themen gestrichelt bis heute bzw. bis zum
  nächsten Termin, Text am Punkt beim Darüberfahren). Darunter „Seit dem Termin am …“ (was besprochen wurde und was
  seitdem passiert ist), „Offen“ (bei mir, beim Kunden, nächstes Mal), als Nächstes/frei im Monat/in Klar, dann alle
  Themen als dichte Liste.
  Rückmeldung: sehr cool; Aufgaben sollen genau wie in Klar sein; „wenn du magst, bau es final“.
- Entwurf 4 (17.10.2026, gleicher Link): Aufgaben in Klars Datenform und Bedienung. Liste wie in Klar („Braucht
  dich heute“, „Offen“, „Erledigt“), Zeile mit Haken, nächstem Punkt, „3/5“, nachfragen/fällig. Antippen öffnet
  das Blatt rechts (Handy ganzseitig): Stand, Angefangen/Pausieren, Abhaken, Wer ist dran (Ich, Warte auf …,
  Wiedervorlage), Priorität, Fällig, Unterpunkte (Haken offen → läuft → erledigt, Nummer, Notiz, ab „läuft“
  Lösung, warte auf … mit Nachgefragt/Antwort kam), Punkt hinzufügen, Erledigt, Verlauf, Festhalten (Ganze
  Aufgabe oder ein Punkt, ⌘↵), Notiz. In der Akte steht dieselbe Aufgabe im Reiter Aufgaben. Heute zeigt
  „Nachfragen“ nach Klars Rhythmus.
  Rückmeldung: „final bauen“, darf auf `main`, GitHub Pages eingestellt, erst nur Testkunden.
- Echte Fassung (17.10.2026): wie Entwurf 4, dazu Anmeldung mit dem Klar-Konto, Daten im Konto, Aufgaben direkt in
  Klar (siehe „Konto und Klar“).

## Aufbau
- `index.html` – die ganze App. Erstes Script `<script id="kern">`: Daten (Kunde mit `themen`, `termine`, `finanzen`,
  `verlauf`; `aufgaben` = Klar-Aufgaben je Kunde), `WIKI` (Beispiel-Abläufe), `GRUPPEN` (Finanzen), Beträge lesen,
  Summen, Kunde und Termin anlegen, Themen erkennen, Aufgabe und Mail bauen, Übernehmen, Abhaken. Läuft auch in Node (`test/kern.spec.js`). Zweites Script: Oberfläche
  (Zustand `S`, `render()`, `go(seite)`). CSS in einem `<style>`-Block (Tokens → Grundlagen → Bausteine → Bereiche).
  Look nach Skill `app-ui`, Schrift Geist über Google Fonts.
- Drittes Teil im zweiten Script: `KONTO` (nur mit `#wolkeziel`): Anmeldung, Laden, Speichern, Live-Abgleich,
  Schreiben in Klar. Ohne Ziel bleibt es der Entwurf (Beispielkunden, `sessionStorage`).
- `wolke.json` – Supabase-Adresse und öffentlicher Schlüssel, dieselben wie in Klar. Nie den geheimen Schlüssel.
- `scripts/` – `serve.mjs` (:5190 Entwurf, `/konto` echte Fassung gegen den Test-Speicher, `/konto?echt` gegen das
  echte Projekt), `bauen.mjs` (echte Fassung nach `public/` mit Ziel, Manifest, App-Zeichen), `check.mjs`,
  `artefakt.mjs <ziel>` (Entwurf fürs Claude-Artifact), `icons.mjs` (PNG aus `icon/zentrale.svg`: Themen-Ring).
- `.github/workflows/pages.yml` – bei jedem Push prüfen und testen; auf `main` bauen und auf GitHub Pages stellen.
- `test/konto.spec.js` – echte Fassung gegen nachgebautes Supabase (wie Klars `test/wolke.spec.js`): Anmelden,
  Kunde im Konto, „@Name“-Aufgabe aus Klar, Schreiben nur der eigenen Aufgabe mit Sicherung vorher, Nachbereiten
  nach Klar, Änderungen aus Klar live, gleichzeitiges Speichern, Klar überschreibt mit älterem Stand.
- `test/` – `kern.spec.js` (u. a. Klars Form, Punkt-Zyklus, Warten-Rhythmus, Festhalten), `app.spec.js` (Heute, Kunde
  anlegen, Finanzen, Termin, Nachbereiten, Landingpage, Aufgabenliste und Blatt wie in Klar, Warten/Nachfragen/
  Antwort, Kundensicht, Neuladen, Handy, hell/dunkel, keine doppelten IDs).

## Befehle
- `npm test` – Fehlercheck + alle Tests, vor jedem Commit grün. Cloud-Sitzung: `PW_CHROMIUM=/opt/pw-browsers/chromium npm test`.
- `npm run dev` – http://localhost:5190 (Entwurf), http://localhost:5190/konto (mit Konto, Test-Speicher).
- Veröffentlichen: auf `main` pushen, GitHub Actions testet, baut und stellt auf Pages.
- Entwurf zeigen: `node scripts/artefakt.mjs <scratchpad>/zentrale.html`, dann Artifact publish auf die URL oben.

## Regeln
- Repo **öffentlich**: keine Kundennamen, Mitschriften, Beträge. Testdaten erfunden (Lea Muster, Jonas und Mira
  Beispiel, Tom Probe, Sven Testmann). `check.mjs` lehnt Dokumente und Schlüssel ab.
- Kein Titelbalken oben links. Umschalter Heute/Kunden/Aufgaben oben in der Mitte.
- Dicht (Lukas, 17.10.2026): Text 14 px, Karten Radius 16/Innenabstand 16, Felder 38 px (Handy 16 px Schrift),
  Knöpfe 36, Chips 30, Pillen 22, Listenzeilen 10 px, Titel 24–26 px. Platz bekommt nur der Blickfang im Überblick.
- Stand eines Themas immer mit Wort, nie nur Farbe: bei mir = Flieder voll, beim Kunden = Flieder schraffiert,
  nächstes Mal = grau, erledigt = grün.
- Aufgaben nach den Klar-Regeln: eine Aufgabe je Kunde (`@Name`), Unterpunkte konkret, „Termin vereinbaren“ und
  „Termin vorbereiten“ (was, steht in der Notiz). Wartet der Kunde, steht am Punkt `warten {art: "kunde", seit,
  nachgefragt}`; nachfragen wie in Klar nach 3, 7, 14, 21 Tagen.
- **Aufgaben haben Klars Datenform** (aus `LULKASSS/klar`, `test/beispiel.json` und `src/klar.html`): Aufgabe
  `{id, titel, cluster, prio, faellig, status, erstellt, erledigtAm, notiz, punkte, verlauf, wiederholung, laeuft,
  warten, vorlage}`, Punkt `{id, t, ok, st (offen|laeuft|fertig), loesung, notiz, warten}`, Verlauf
  `{id, am, text, art (auto|hand), quelle, pid, pfertig}`. Was nur die Zentrale braucht, steht zusätzlich daran und
  Klar lässt es stehen: `aufgabe.kunde`, `punkt.thema`, `punkt.art`, `punkt.kundeText`, `punkt.intern`. Damit können
  die Punkte später 1:1 in Klars `stand/aktuell`.
- Bedienung der Aufgaben wie in Klar (Haken-Zyklus, Notiz immer, Lösung ab „läuft“, Festhalten, Erledigt-Liste);
  Ocker heißt „läuft“ wie dort.
- In der Ansicht mit dem Kunden bleibt Internes weg: nur Überblick, Finanzen, Verlauf; keine Kontaktdaten, keine
  Klar-Einträge, kein „Neuer Termin“.
- Entwurf speichert nur im Tab (`sessionStorage`, Schlüssel `zentrale.entwurf.3`), „Beispiel neu laden“ unter „Entwurf“.
  Die echte Fassung speichert im Konto, nicht im Browser.

## Konto und Klar (echte Fassung)
- Dieselbe Anmeldung (Speicher `klar.anmeldung`) und Tabelle wie Klar: `klar_dokumente`, Zeilensicherheit je Nutzer.
- Die Zentrale hat `zentrale/aktuell`: `daten = {stand: JSON {fassung: 1, kunden}, zuletzt, geraet, geraetname}`.
- Die Aufgaben stehen in Klars `stand/aktuell` (nicht doppelt in der Zentrale). Eine Klar-Aufgabe gehört zu einem
  Kunden, wenn sie `kunde` trägt oder „@Name“ heißt (dann bekommt sie `kunde` beim nächsten Schreiben).
- Schreiben in Klar: frisch lesen, vor dem ersten Schreiben je Sitzung `sicherungen/<Zeit>` mit `grund: "vor Zentrale"`,
  nur die geänderten Aufgaben gegen den frischen Stand zusammenführen (`zusammenfuehren`: je Feld und je Punkt gewinnt,
  wer geändert hat, Verlauf vereinigt), zurück mit `zuletzt` innen und außen gleich, `geraet: "zentrale"`. Bedingt
  geschrieben (`daten->>zuletzt` wie gelesen), sonst bis zu dreimal neu lesen und zusammenführen.
- Klar übernimmt den Stand live. Hatte Klar gerade eigene ungespeicherte Arbeit, behält es seinen Stand (und legt beide
  als Sicherung ab); die Zentrale erkennt das und schreibt ihre Änderung nochmal.
- Immer nur ein Speichervorgang zugleich; das eigene Echo im Live-Abgleich wird erkannt (`schreibt`).
- Klars Darstellung der Zentrale-Aufgaben ist geprüft (Notiz mit Wiki-Ablauf, Verlauf am Punkt, läuft, wartet).

## Annahmen (Lukas vorlegen)
- Die Abläufe in `WIKI` sind Beispiele (Haftpflicht/Hausrat rechnen in PW oder Xempus, BU-Voranfrage, Altersvorsorge
  vorbereiten mit dem Investmentrechner). Die echten kommen aus dem Persönlichen Wiki.
- Abhaken des letzten eigenen Punkts eines Themas setzt es auf „beim Kunden“ (Angebot geschickt); erledigt der Kunde
  seinen Teil, geht es zurück zu Lukas (BU, Kfz) oder ist erledigt.
- Abhaken eines Punkts, auf den beim Kunden gewartet wurde, oder „Antwort kam“ gibt das Thema an Lukas zurück
  (BU: Voranfrage stellen, Kfz: Angebot rechnen), sonst ist es erledigt.
- Finanzen: frei = Einnahmen − (Wohnen und Verträge + Versicherungen + Leben + Sparen und Vorsorge). Vermögen getrennt,
  zählt nicht mit. Keine Bewertung, nur Zahlen.

## Weg (Stand 17.10.2026)
1. Klickbarer Entwurf mit erfundenen Daten. Erledigt.
2. Konto und Klar: erledigt (17.10.2026). Offen daraus: Abhaken in Klar schreibt das Thema in der Zentrale noch nicht
   fort (nur in der Zentrale), Abläufe noch aus `WIKI` statt aus `wiki/aktuell`, Claude-Ergänzung aus dem Freitext
   (kleiner Dienst bei Supabase mit API-Schlüssel, nicht in der Seite).
3. Finanzen beim Kunden (aus der Finanzakte nur, was abgenommen war).
4. Professional Works (Mails, Verträge), wenn die API geklärt ist.

## Offen für Lukas
- Datenschutz: Kunden-Finanzdaten bei Supabase (Frankfurt). AVV mit Supabase prüfen, Vorgaben von FINPAL klären.
  Vorher keine echten Kundendaten in die Zentrale (Lukas, 17.10.2026: startet mit Testkunden).
- Wo liegt der Code der Finanzakte-Ansicht aus dem Screenshot? In `LULKASSS/finanzaufnahme` ist sie nicht (Stand 17.10.2026).
