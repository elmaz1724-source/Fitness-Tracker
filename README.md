# FORGE – Persönlicher Fitness Tracker

**Version 8.3 – Essentials zurück:** Die einfache Ansicht zeigt wieder die fünf Tagesziele, einen kompakten 3-Blöcke-Plan und den echten 7-Tage-Schrittverlauf. „Weitere Funktionen“ ist jetzt ebenfalls graphitfarben mit wenigen blauen Akzenten. Drei Hauptansichten, dieselben gespeicherten Werte und keine neuen Tracking-Formate.

Mobile-first Fitness-Tracker, veröffentlicht über GitHub Pages:  
https://elmaz1724-source.github.io/Fitness-Tracker/

## Funktionen

- Tägliche Checkliste, großer Schrittzähler mit verbleibenden Schritten bis 10.000 und optionaler Smart Daily Planner
- Walking-Pad-Rechner (frei einstellbares Tempo und Steigung), 3-Blöcke-Plan
- Walking-Autopilot mit vorsichtigen Tempoempfehlungen, keine Gerätesteuerung
- Zentrale Schritteingabe unter **Heute**; Quick Log für Gewicht, Kreatin und Backup
- Gewichtsverlauf mit 7-Tage-Durchschnitt, Wochenvergleich und Zielprognosen
- Trainingsjournal mit Sätzen, Wiederholungen, Gewichten und Vorwertvergleich
- Kalenderwochentracker (montags automatisch neue Woche)
- In-App-Erinnerungen, manuell ein- und ausschaltbar
- Manueller CSV-Import von Schritten und Gewicht, plus Apple-Health-Kurzbefehle-Brücke (bestätigter Import ohne Server)
- Exportierbare wiederkehrende Kalendererinnerungen, auch außerhalb von FORGE sichtbar (nach manuellem Kalenderimport)
- Export und Import aller lokalen Fitnessdaten als JSON, jetzt auch direkt auf dem Startbildschirm (Quick Log)
- Installierbare Web-App mit Offline-Shell

**Nicht implementiert:** Ernährungstagebuch, unsichtbare direkte HealthKit-/Garmin-Cloud-Synchronisierung, eigene Web-Push-Server. Kurzbefehle können Health-Daten auslesen und mit einem Link an FORGE übergeben, benötigen aber zum tatsächlichen Import das Öffnen der Website sowie eine Bestätigung. Kalendererinnerungen laufen nach dem Import über die Kalender-App, nicht über FORGE-Push.

## Schritte einfach erfassen

Im Bereich **Heute → Dein Schrittzähler** steht der aktuelle Gesamtstand. Gib in **Wie viele Schritte hast du bisher?** die **insgesamt bereits gegangenen Schritte** ein, z. B. `5000`, und tippe auf **Speichern**. FORGE zeigt dir sofort `5000` von `10000` und `5000` noch fehlende Schritte an. Bei `10500` zeigt FORGE das Ziel als erreicht an, ohne negative Restwerte.

Es gibt auf dem Startbildschirm **keine zweite sichtbare Schritteingabe**. Quick Log kümmert sich um Gewicht, Kreatin und Backups. Über den optional aufklappbaren **Walking-Planer** kannst du die restliche Gehzeit berechnen; er verwendet genau denselben bereits gespeicherten Schrittstand.

Die Speicherung nutzt wie bisher ausschließlich `fitness-planner-YYYY-MM-DD`. Alte Tageswerte, Gewichtsdaten und Fitness-Einträge bleiben erhalten. Nach einem Apple-Kurzbefehle-Import sind die übergebenen Schritte im gleichen zentralen Schrittzähler zu sehen.

## Walking übernimmt Schritte aus „Heute“

Der **Schrittzähler unter Heute** bleibt die einzige Stelle, an der du deinen tatsächlich gelaufenen Tagesstand einträgst. Sobald du den Wert speicherst, aktualisieren sich im Bereich **Walking** sofort „Schon gelaufen“, „Fehlen bis 10.000“, der Fortschrittsbalken sowie die geplante Walking-Pad-Dauer.

- **Fehlende Schritte auffüllen (Standard):** FORGE plant automatisch genau die Schritte, die noch bis 10.000 fehlen. Beispiel: 5.000 gelaufen → 5.000 Walking-Pad-Schritte geplant. Bei bereits erreichten 10.000 → 0 zusätzlich.
- **Eigene Einheit planen:** Du kannst die Walking-Pad-Schritte und weitere **zukünftig geplante** Schritte selbst festlegen. Bereits gelaufene Schritte werden automatisch zusätzlich berücksichtigt und nicht nochmals eingetragen.
- Die komplette Walking-Statistik unterscheidet **bereits gelaufene** und **erst geplante** Schritte. Das geplante Ergebnis wird nicht als tatsächlich erreicht behandelt.
- Die früheren frei gewählten Walking-Pad- und weiteren Schrittzahlen bleiben unter `fitness-walking` gespeichert; beim Umschalten in den Automatikmodus werden sie nicht überschrieben.
- Der optionale Walking-Planer unter Heute kann eine individuelle Einheit weiterhin ausdrücklich in den Walking-Rechner übertragen. Dabei wird der bereits gelaufene Stand nicht doppelt gezählt.

Die **Quelle der tatsächlich absolvierten Schritte** ist unverändert `fitness-planner-YYYY-MM-DD`. Eingaben aus Quick Log bzw. aus einem Apple-Kurzbefehle-Import verwenden weiterhin diesen gespeicherten Tageswert. Tempo, Neigung und Schrittlänge bleiben individuell einstellbar.

## Walking auf dem iPhone: kompakt statt überladen

Der Bereich **Walking** zeigt zuerst:
- Tatsächlich gelaufene und noch fehlende Schritte bis zum Tagesziel.
- **Fehlende Schritte auffüllen** oder **Eigene Einheit planen**.
- Eine hervorgehobene Karte mit **geschätzter Gehzeit**, zusätzlichen Walking-Pad-Schritten, Tempo, Distanz, Neigung und voraussichtlichem Tagesstand.
- Den Button **Schrittstand aktualisieren**, um nach der Einheit den echten Gesamtstand unter Heute zu erfassen.

Die umfangreichen Optionen sind standardmäßig **geschlossen**, aber weiterhin vollständig vorhanden: Unter **Einstellungen & 3-Blöcke-Plan** findest du Tempo, Neigung, Schrittlänge, eigene Schrittzahlen und die Aufteilung der Walking-Einheit. Wenn du **Eigene Einheit planen** auswählst, wird dieser Bereich automatisch geöffnet. Zurück zum automatischen Modus schließt ihn wieder.

Auch **Wochenverlauf ansehen** ist optional aufklappbar. Dahinter liegen die sieben tatsächlichen Tageswerte und der bisherige manuelle Wochentracker. Es werden keine Daten verschoben oder gelöscht; die gleichen lokalen Speicher-Keys bleiben bestehen.

## Walking abgeschlossen und Schritte im Rückblick

Nach einer Walking-Einheit im Bereich **Walking** auf **Schrittstand aktualisieren** tippen. FORGE öffnet dann automatisch den zentralen Schrittzähler unter **Heute**. Trage dort den **tatsächlich gemessenen Gesamtstand** ein (z. B. aus Apple Health bzw. Apple Watch). FORGE addiert **keine geplanten Schritte von selbst**, denn diese könnten in Apple Health bereits enthalten sein. Damit wird eine versehentliche Doppelzählung verhindert.

Direkt im Walking-Bereich siehst du auch die **letzten 7 Kalendertage** als kleine Balkenübersicht. Erfasst wird ausschließlich `fitness-planner-YYYY-MM-DD`: tatsächliche Gesamtstände, nicht geplante Walking-Pad-Einheiten. Nicht erfasste Tage bleiben als fehlend markiert und werden **nicht als null Schritte** in den Durchschnitt eingerechnet. Die Übersicht zeigt die Zahl der erfassten Tage, deren Durchschnitt und die Tage mit mindestens 10.000 Schritten. Neue Werte aktualisieren die Übersicht sofort.

## Apple Health über Kurzbefehle (ohne Server)

In FORGE unter **Training → Apple Health → FORGE** auf **Vorlage für Kurzbefehle kopieren** tippen.

Die Vorlage sieht so aus (die Platzhalter werden in der Kurzbefehle-App zu dynamischen Werten):

```text
https://elmaz1724-source.github.io/Fitness-Tracker/#forge-sync?date=DATUM&steps=SCHRITTE
```

Optional `&weight=GEWICHT` ergänzen (kg mit Punkt oder Komma). Du kannst auch nur Gewicht importieren, wenn der `steps`-Teil entfernt wird. Das Datum muss im ISO-Format `yyyy-MM-dd` übergeben werden.

1. In **Apple Kurzbefehle** einen Kurzbefehl anlegen.
2. Über die Health-Aktionen deine tatsächlich gelaufenen Schritte des aktuellen Kalendertags abfragen und als Gesamtwert ausgeben. Wenn mehrere Geräte Messwerte liefern, mögliche Dopplungen der Health-Stichproben beachten und nach Datenquelle filtern.
3. Optional das aktuelle Körpergewicht aus Health lesen und in kg formatieren.
4. Den Link mit den dynamischen Variablen bauen und mit **URLs öffnen** ausführen.
5. In FORGE die importierten Werte bestätigen. Bereits vorhandene Messungen werden nicht stillschweigend überschrieben.

**Datenschutz:** Die Messwerte stehen im URL-**Fragment** (`#...`) und werden damit nicht an GitHub Pages geschickt. FORGE entfernt das Fragment unmittelbar aus der Adresszeile und speichert Werte nur lokal. Trotzdem sollte ein solcher Link nicht öffentlich geteilt werden. Ein Kurzbefehl kann über iOS-Automationen ausgelöst werden, aber eine stille Hintergrund-Synchronisation ohne Öffnen und Bestätigen gibt es mit dieser GitHub-Pages-Lösung nicht.

Wichtig: Wenn der Link Safari statt der installierten Home-Bildschirm-App öffnet, können deren lokalen Datenbestände getrennt sein. Erst in Safari prüfen, ob FORGE dieselben Daten wie in der installierten App zeigt. Ggf. JSON-Backup exportieren/importieren, statt Browserdaten zu löschen.

**Garmin:** Die Garmin Connect Personal API existiert, benötigt aber ein privates API-Secret und Access Token. Schlüssel dürfen nicht im öffentlichen GitHub-Repository oder in GitHub-Pages-JavaScript stehen. Bis eine sichere Serverkomponente vorhanden ist, den vorhandenen CSV-Import verwenden.

## Erinnerungen per iPhone-Kalender

Unter **Training → iPhone-Kalendererinnerungen** gewünschte Erinnerungstypen (Gewicht, Kreatin, Schritte) sowie Uhrzeiten auswählen und auf **Kalendererinnerungen herunterladen** tippen. Es wird eine `FORGE-Erinnerungen.ics`-Datei mit wiederkehrenden täglichen Terminen samt Alarm erzeugt. Erst nach dem **bewussten Import** in deine Kalender-App entstehen Termine. Ein wiederholter Import kann je nach Kalender-App Duplikate erzeugen; vor erneutem Import bestehende Termine prüfen. Kalenderbenachrichtigungen müssen auf dem iPhone aktiviert sein.

Bei variablem Schlafrhythmus kannst du alternativ in Apple Kurzbefehle eine Automation bei **Wecker gestoppt** erstellen. FORGE selbst kann ohne zusätzliche Serverinfrastruktur keine zeitgesteuerten Web-Pushs verschicken.

## Datenspeicherung

Gespeichert wird ausschließlich in `localStorage` im Browser. Es gibt keinen Server und keinen Nutzer-Account. Ein Wechsel von Safari in den Home-Bildschirm-Modus oder zu einem anderen Gerät kann einen anderen lokalen Speicherbereich bedeuten: vorher **Backup exportieren**, danach **Backup importieren**.

**Vor einer Neuinstallation der Home-Bildschirm-App oder dem Löschen von Safari-Daten:** Unter **Heute → Quick Log → Backup sichern** die JSON-Datei herunterladen und prüfen, dass sie in der Dateien-App tatsächlich gespeichert ist. Bei Bedarf über **Wiederherstellen** importieren. Der Import fragt vor dem Überschreiben vorhandener Werte nach Bestätigung.

**Bestehende Keys bleiben erhalten**, z. B. `fitness-walking`, `fitness-weights`, `fitness-daily-YYYY-MM-DD` und `fitness-week`. Neu dazu kommen datierte `fitness-week-YYYY-MM-DD`- und `fitness-planner-YYYY-MM-DD`-Einträge sowie `forge-...`-Einträge. Alten Wochentracker übernimmt FORGE bei der ersten Migration, spätere Wochen beginnen wieder bei null.

## CSV-Import (für manuell exportierte/umgewandelte Daten)

Beispiel: Semikolon als Trennzeichen für deutsche Dezimalzahlen:

```csv
date;steps;weight
2026-10-25;8650;92,6
2026-10-26;10040;92,4
```

Es reichen die Spalten `date` und `steps` **oder** `weight`. Datumsformat `YYYY-MM-DD`, Schritte als ganze Zahlen, Gewicht in kg. FORGE kann nicht jedes unveränderte Garmin- oder Apple-Health-Exportformat unmittelbar lesen; gegebenenfalls CSV vorher anpassen. Vor Überschreiben bestehender Werte wird gefragt.


## Veröffentlichung – wichtig bei einer veralteten GitHub-Pages-Seite

Ab Version 6 gibt es einen eigenen Deploy-Workflow:

- Datei: `.github/workflows/publish-forge.yml`
- Er veröffentlicht bei jedem Push auf `main` die aktuelle statische App inklusive CSS, JS, Manifest und Service Worker.
- Der Workflow prüft die JavaScript-Syntax, doppelte HTML-IDs und das Manifest, bevor er ein Deploy-Artefakt erzeugt.

**Einmalige Einstellung im Repository:** `Settings → Pages → Build and deployment → Source → GitHub Actions` auswählen. Ohne diese Einstellung kann GitHub Pages weiterhin aus einer früher konfigurierten Quelle veröffentlichen. Danach den Workflow `Publish FORGE to GitHub Pages` unter `Actions` prüfen beziehungsweise über `Run workflow` manuell starten. Erst wenn der Deploy-Job **success** meldet und die Live-Seite die Version `FORGE 6.0` im Footer zeigt, ist die neue Veröffentlichung verifiziert.

**Wichtig bei einem iPhone mit alter Version:** Zuerst deine Daten über **Fortschritt → Daten sichern → Backup exportieren** retten. Lösche nicht blind Browser-Website-Daten oder die installierte Web-App – gespeicherte Fitnesswerte liegen nur lokal. Danach Seite neu laden oder mit `?v=6` öffnen, falls noch ein zwischengespeichertes Dokument angezeigt wird.

## Veröffentlichungsdiagnose ab FORGE 6.0.1

Der Workflow versucht zunächst, die GitHub-Pages-Quelle auf **GitHub Actions** zu setzen. Falls GitHub die Umstellung über den Workflow-Token verweigert, erscheint im Workflow ein konkreter Fehler; in diesem Fall muss die Einstellung unter **Settings → Pages → Source → GitHub Actions** manuell vorgenommen werden.

Der veröffentlichte Build enthält nun `build-info.json` mit Versionsnummer, Commit-ID und Erstellungszeitpunkt. Unter **Training → Systemcheck auf deinem Gerät** prüft FORGE diese Datei und zeigt einen Versionskonflikt an. Es werden dafür keine Gewichts-, Trainings- oder Schrittdaten übertragen.

Auch der Workflow prüft nach dem Deploy, ob `build-info.json` von der öffentlichen Adresse mit der erwarteten Commit-ID ausgeliefert wird. Bei noch ausstehender CDN-Aktualisierung erscheint eine Warnung. 

## FORGE 8.3 – Tagesziele, 3 Blöcke und Wochenverlauf

Beim Back-to-Basics-Reset wurden einige bewährte Elemente versehentlich mit ausgeblendet. Die bestehenden Funktionen wurden nicht gelöscht und sind nun mit geringerem Platzbedarf wieder Teil der **einfachen Ansicht**:

| Ansicht | Wieder sichtbar | Datenbasis |
| --- | --- | --- |
| **Heute** | Die ursprünglichen fünf Tagesziele als kompakte, einzeln abhäkbare Liste: Kalorien, Protein, 10.000 Schritte, Krafttraining/Erholung, Regeneration; ein leiser Fortschrittsbalken | Unverändert `fitness-daily-YYYY-MM-DD`; **kein Mahlzeiten- oder Ernährungstracking** |
| **Walking** | Drei einfache Zeilen „Morgens / Mittags / Abends“ mit Schrittzahl und geschätzter Dauer | Die bestehende Walking-Berechnung; **30 % / 30 % / Rest** der *noch geplanten* Pad-Schritte, exakt ohne Rundungsabweichung |
| **Walking** | Sieben Tagesbalken, erreichte 10.000er-Tage, Durchschnitt und Erfassungstage | Ausschließlich tatsächlich gespeicherte Tagesstände aus `fitness-planner-YYYY-MM-DD`; fehlende Einträge zählen nicht als null |
| **Weitere Funktionen** | Die älteren Formulare, Erinnerungen, Trainingslogs, importierten Werte und Zusatzkarten nutzen dieselben neutralen Graphitflächen wie die einfache Ansicht | Keine Änderung an Einstellungen, Berechnungen und Backups |

**Wichtig:** Tagesziele bleiben manuell abhäkbare Checklisten (keine zusätzliche Nahrungserfassung). Der 3-Blöcke-Plan ist nur ein Vorschlag; geplante Schritte werden niemals als gelaufen gezählt. Der alte manuelle Wochentracker bleibt getrennt von der tatsächlichen 7-Tage-Schrittstatistik in der erweiterten Ansicht erhalten.

Zur Qualitätssicherung wurden `scripts/test-restored-basics.mjs` und die bisherigen Workflow-Tests kombiniert. Getestet werden außerdem sehr kleine und ungerade Rest-Schrittzahlen (z. B. 1 Schritt), damit die drei Zeilen in Summe immer exakt stimmen.

## FORGE 8.2 – Graphite + Accent

FORGE 8.1 war dem Nutzer deutlich **zu blau**. Die neue Designrichtung orientiert sich an den Prinzipien von Emil Kowalski und der zurückhaltenden Klarheit guter iPhone-Apps, ohne Apples visuelle Gestaltung zu kopieren.

| Bereich | FORGE 8.1 | FORGE 8.2 |
| --- | --- | --- |
| Oberfläche | Viele navyblaue Flächen und farbige Rahmen | Neutrales Graphit (`#101114`), anthrazitfarbene Karten (`#1b1d22`) und sehr dezente Trennlinien |
| Typografie | Mehrere blau hervorgehobene Werte | Große Fitnesszahlen überwiegend weiß (`#f5f6f8`), hilfreiche Informationen in Grau |
| Navigation | Ausgefüllte blaue Auswahl | Dezente dunkle Auswahlfläche; Blau nur am aktiven Symbol |
| Aktionen | Mehrere blaue Buttons | Blau (`#82b4ff`) für **Schritte speichern**, **Gewicht speichern** und Fortschrittswerte; sonst neutrale Aktionen |
| Fortschritt | Stärker blau eingefärbte Karten und Diagramme | Schlanke blaue Schrittbalken; Gewichtsdiagramm mit neutralen Messpunkten und einer blauen Durchschnittslinie |

**Keine zusätzlichen Funktionen.** Die drei einfachen Bereiche bleiben bestehen: **Heute** für tatsächliche Schritte und Rest bis 10.000, **Walking** für Gehzeit/Tempo/Neigung und **Fortschritt** für Gewicht. Die erweiterten Funktionen bleiben über das Menü erreichbar, ohne Daten zu löschen.

**Verwendete Skills:** `emil-design-eng`, `mobile-native`, `apple-design`. Dabei wurden Anregungen zu Zurückhaltung, Typografie, Fokus-/Touch-Rückmeldung und minimaler Animation umgesetzt – keine neue Animationsbibliothek oder überflüssige Übergänge.

**Prüfung:** `node scripts/test-graphite-theme.mjs` und die bisherigen Tests in GitHub Actions. Der alte blaulastige Design-Test wurde ersetzt. Eine tatsächliche visuelle Kontrolle im iPhone-Safari-/Home-Screen-Modus muss nach dem Deployment erfolgen.

## FORGE 8.0 — Back to Basics

Die App wurde bewusst auf ihren ursprünglichen Zweck zurückgeführt. Beim normalen Öffnen sind nur noch **drei Tabs** sichtbar:

| Bereich | Wofür? |
| --- | --- |
| **Heute** | Den tatsächlich gegangenen Schrittstand eintragen, sofort sehen, wie viele bis **10.000** fehlen |
| **Walking** | Die fehlenden Schritte auf dem Walking-Pad planen; **Tempo und Neigung** einstellen; ungefähre Dauer sehen |
| **Fortschritt** | Körpergewicht eintragen, aktuellen Stand und übersichtlichen Gewichtsverlauf sehen |

**Nicht mehr im Vordergrund:** Daily Checklists, Smart Daily Planner, Coaching-Erinnerungen, Makro-Referenzen, Gewichtsprognosen, 3-Blöcke-Pläne, Trainingslog, Health-Shortcuts-Einrichtung, Kalenderexport und Systemchecks.

**Nichts gelöscht:** Alle Originalmodule und die alten localStorage-Schlüssel bleiben vorhanden. Das Menü oben rechts bietet **„Weitere Funktionen öffnen“**, falls du alte Trainingsaufzeichnungen, komplexe Walking-Einstellungen, Datenimporte oder Benachrichtigungen brauchst. **„Zur einfachen Ansicht“** führt zurück. Ein Backup kann direkt aus dem einfachen Menü angefordert werden. Nach Neustart öffnet FORGE wieder im einfachen Modus.

Im einfachen Walking-Modus wird die bereits gelaufene Schrittzahl wie bisher aus `fitness-planner-YYYY-MM-DD` gelesen und automatisch die noch fehlende Distanz bis zu 10.000 berechnet. Die erweiterten persönlichen Walking-Pläne werden beim Anzeigen des einfachen Modus **nicht überschrieben**. Tempo und Neigung verwenden die vorhandene Berechnung, keine zweite Tracking-Datenbank.

Diese Vereinfachung ist ein **Präsentations-Reset**, kein technischer Daten-Reset. Bitte Browserdaten nicht löschen. Bestehende Backups bleiben gültig.

**Tests:** `node scripts/test-basics.mjs`, `node scripts/test-navigation.mjs`, `node scripts/verify-agent-skills.mjs` sowie die vorhandenen GitHub-Workflows.

## Navigation nach Jakob's Law (FORGE 7.6)

Die Nielsen Norman Group beschreibt mit **Jakob's Law**, warum Nutzer eine vertraute App-Navigation erwarten. FORGE übernimmt nur die passenden Muster, nicht die Oberfläche von Instagram/TikTok/YouTube.

| Vorher | Jetzt | Warum |
| --- | --- | --- |
| Vier Tabs: Heute, Walking, Fortschritt, Training | **Dieselben vier Tabs** bleiben unverändert, mit Heute ganz links | Hauptnavigation muss stabil und leicht lernbar sein |
| Erinnerungen, Health, Backup und Systemcheck über mehrere Bereiche verteilt | **Einstellungen-Symbol oben rechts** öffnet Schnellzugriffe zu den vorhandenen Abschnitten | Sekundäre Einstellungen nicht als neuer Tab |
| Tabwechsel hatten keine Browser-Historie | Tabwechsel werden per **History API** erfasst, Browser-Zurück kann wieder den vorherigen Tab anzeigen | Vertrautes Zurück-Verhalten ohne eigene Swipe-Geste |
| Keine verpflichtende Profilverwaltung | **Kein künstlicher Profil-Tab** | Die Web-App benötigt aktuell kein Konto |
| Schritte, Training und Backup haben bereits eigene Aktionen | **Keine zusätzliche zentrale Plus-Schaltfläche** | Aktionen dort, wo ihre Inhalte hingehören |

**Bedienung:** Oben rechts das Zahnrad öffnen und *Erinnerungen*, *Health & Daten*, *Datensicherung* oder *iPhone-App & System* auswählen. FORGE wechselt in den bestehenden Bereich und springt zur jeweiligen Einstellung. Tippen außerhalb oder Escape schließt das Menü. Ein Back-Gesture wird **nicht** künstlich abgefangen: Der Browser kann seine native Zurück-Navigation nutzen, wo er sie anbietet. Ob die installierte iOS-Home-Bildschirm-App dieselbe Geste bietet, muss auf dem iPhone getestet werden.

**Pull-to-Refresh:** Wir überschreiben die Browserfunktion nicht und bauen keine zusätzliche automatische Aktualisierung, die offene Eingaben verwerfen könnte.

## Codex-Agent-Skills und UI-Qualitätsleitfaden

Alle **17 Skill-Einstiegspunkte** aus [emilkowalski/skills](https://github.com/emilkowalski/skills) sind mit ihren neun ergänzenden Markdown-Dateien projektlokal unter `.agents/skills/` eingebunden. Dazu kommen die zwei unveränderten Cheatsheets, Upstream-README und MIT-Lizenz in `docs/emil-kowalski/`.

- Codex-Regeln und Auswahl je nach Aufgabe: [AGENTS.md](AGENTS.md).
- Exakter Installationsstatus und Einschränkungen: [docs/SKILLS_INSTALLATION.md](docs/SKILLS_INSTALLATION.md).
- Priorisierte App-Analyse und nächste Schritte: [docs/FORGE_UI_AUDIT_2026-11-07.md](docs/FORGE_UI_AUDIT_2026-11-07.md).
- Integritätsprüfung ohne zusätzliche Pakete: `node scripts/verify-agent-skills.mjs` (auch im Pages-Workflow).

**Installationstransparenz:** Der offizielle CLI-Versuch mit `npx skills@latest add emilkowalski/skills --skill '*' --agent codex` scheiterte in der Assistenz-Laufzeit wegen `EAI_AGAIN` (NPM-DNS). Die Originaldateien wurden stattdessen über den verbundenen GitHub-Zugang unverändert in das Projekt übernommen und mit ihren Upstream-Git-Hashes verifiziert. Die tatsächliche Skill-Erkennung in einer lokalen Codex-Sitzung muss nach Checkout/Neustart dort geprüft werden.

Die erste Qualitätsrunde optimiert iOS-Bedienung, `aria-current` der Navigation, klare Touch-/Fokuszustände und zwei Schrittfortschrittsbalken mit compositorfreundlicher `transform`-Animation. App-Daten werden dafür nicht umgeschrieben.

## Test auf dem iPhone

1. FORGE in Safari öffnen, Seite neu laden.
2. Auf **Training → Systemcheck auf deinem Gerät → Gerätetest starten** tippen. Prüfen, ob lokaler Speicher, Service Worker und Offline-Startdatei bereit sind.
3. Auf dem iPhone über Safari „Teilen“ → „Zum Home-Bildschirm“ → „Als Web-App öffnen“ installieren.
4. Nach dem ersten Online-Start Flugmodus aktivieren und FORGE offline erneut öffnen. Die Startseite und lokale Daten sollten weiterhin vorhanden sein.
5. Zum Schluss JSON-Backup exportieren. Beachte: Der Systemcheck verschickt keine Daten und kann nicht jede iPhone-/Safari-Version simulieren.

## Technisches

Reines HTML/CSS/Vanilla-JavaScript ohne externe Bibliotheken. Die Web-App verwendet ein Manifest und einen Service Worker mit Network-First-Strategie und Offline-Fallback. Bei Änderungen an Shell-Dateien Cache-Version in `sw.js` erhöhen.

Aktuelle Version: **8.3.0** (Graphite mit dezenten blauen Akzenten, ruhige iPhone-Oberflächen; visueller Realgerät-Test noch offen).
