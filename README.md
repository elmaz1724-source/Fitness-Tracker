# FORGE – Persönlicher Fitness Tracker

Mobile-first Fitness-Tracker, veröffentlicht über GitHub Pages:  
https://elmaz1724-source.github.io/Fitness-Tracker/

## Funktionen

- Tägliche Checkliste und persönlicher Smart Daily Planner
- Walking-Pad-Rechner (frei einstellbares Tempo und Steigung), 3-Blöcke-Plan
- Walking-Autopilot mit vorsichtigen Tempoempfehlungen, keine Gerätesteuerung
- Quick Log für **bereits gelaufene** Schritte, Gewicht und Kreatin
- Gewichtsverlauf mit 7-Tage-Durchschnitt, Wochenvergleich und Zielprognosen
- Trainingsjournal mit Sätzen, Wiederholungen, Gewichten und Vorwertvergleich
- Kalenderwochentracker (montags automatisch neue Woche)
- In-App-Erinnerungen, manuell ein- und ausschaltbar
- Manueller CSV-Import von Schritten und Gewicht
- Export und Import aller lokalen Fitnessdaten als JSON
- Installierbare Web-App mit Offline-Shell

**Nicht implementiert:** Ernährungstagebuch, automatische Apple-Health-/Garmin-Synchronisierung, echte Push-Erinnerungen oder automatische Tracking-Gerätedaten.

## Datenspeicherung

Gespeichert wird ausschließlich in \`localStorage\` im Browser. Es gibt keinen Server und keinen Nutzer-Account. Ein Wechsel von Safari in den Home-Bildschirm-Modus oder zu einem anderen Gerät kann einen anderen lokalen Speicherbereich bedeuten: vorher **Backup exportieren**, danach **Backup importieren**.

**Bestehende Keys bleiben erhalten**, z. B. \`fitness-walking\`, \`fitness-weights\`, \`fitness-daily-YYYY-MM-DD\` und \`fitness-week\`. Neu dazu kommen datierte \`fitness-week-YYYY-MM-DD\`- und \`fitness-planner-YYYY-MM-DD\`-Einträge sowie \`forge-...\`-Einträge. Alten Wochentracker übernimmt FORGE bei der ersten Migration, spätere Wochen beginnen wieder bei null.

## CSV-Import (für manuell exportierte/umgewandelte Daten)

Beispiel: Semikolon als Trennzeichen für deutsche Dezimalzahlen:

\`\`\`csv
date;steps;weight
2026-10-25;8650;92,6
2026-10-26;10040;92,4
\`\`\`

Es reichen die Spalten \`date\` und \`steps\` **oder** \`weight\`. Datumsformat \`YYYY-MM-DD\`, Schritte als ganze Zahlen, Gewicht in kg. FORGE kann nicht jedes unveränderte Garmin- oder Apple-Health-Exportformat unmittelbar lesen; gegebenenfalls CSV vorher anpassen. Vor Überschreiben bestehender Werte wird gefragt.

## Test auf dem iPhone

1. FORGE in Safari öffnen, Seite neu laden.
2. Auf **Training → Systemcheck auf deinem Gerät → Gerätetest starten** tippen. Prüfen, ob lokaler Speicher, Service Worker und Offline-Startdatei bereit sind.
3. Auf dem iPhone über Safari „Teilen“ → „Zum Home-Bildschirm“ → „Als Web-App öffnen“ installieren.
4. Nach dem ersten Online-Start Flugmodus aktivieren und FORGE offline erneut öffnen. Die Startseite und lokale Daten sollten weiterhin vorhanden sein.
5. Zum Schluss JSON-Backup exportieren. Beachte: Der Systemcheck verschickt keine Daten und kann nicht jede iPhone-/Safari-Version simulieren.

## Technisches

Reines HTML/CSS/Vanilla-JavaScript ohne externe Bibliotheken. Die Web-App verwendet ein Manifest und einen Service Worker mit Network-First-Strategie und Offline-Fallback. Bei Änderungen an Shell-Dateien Cache-Version in \`sw.js\` erhöhen.

Aktuelle Version: **5.1** (Qualitätsrunde; finales visuelles Redesign folgt).
