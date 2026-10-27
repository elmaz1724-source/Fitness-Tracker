# FORGE – Persönlicher Fitness Tracker

**Version 6.1:** Kompakte iPhone-Navigation, Schnell-Backup direkt im Quick Log, eindeutige Hinweise zu lokalen Daten und bessere Eingaben mit geöffneter Tastatur. Die bisherigen Tracking- und Speicherfunktionen bleiben unverändert.

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
- Export und Import aller lokalen Fitnessdaten als JSON, jetzt auch direkt auf dem Startbildschirm (Quick Log)
- Installierbare Web-App mit Offline-Shell

**Nicht implementiert:** Ernährungstagebuch, automatische Apple-Health-/Garmin-Synchronisierung, echte Push-Erinnerungen oder automatische Tracking-Gerätedaten.

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

## Test auf dem iPhone

1. FORGE in Safari öffnen, Seite neu laden.
2. Auf **Training → Systemcheck auf deinem Gerät → Gerätetest starten** tippen. Prüfen, ob lokaler Speicher, Service Worker und Offline-Startdatei bereit sind.
3. Auf dem iPhone über Safari „Teilen“ → „Zum Home-Bildschirm“ → „Als Web-App öffnen“ installieren.
4. Nach dem ersten Online-Start Flugmodus aktivieren und FORGE offline erneut öffnen. Die Startseite und lokale Daten sollten weiterhin vorhanden sein.
5. Zum Schluss JSON-Backup exportieren. Beachte: Der Systemcheck verschickt keine Daten und kann nicht jede iPhone-/Safari-Version simulieren.

## Technisches

Reines HTML/CSS/Vanilla-JavaScript ohne externe Bibliotheken. Die Web-App verwendet ein Manifest und einen Service Worker mit Network-First-Strategie und Offline-Fallback. Bei Änderungen an Shell-Dateien Cache-Version in `sw.js` erhöhen.

Aktuelle Version: **6.1.0** (Startbildschirm-Backup und kompakte iPhone-Eingabe; Live-Veröffentlichung nach dem Merge noch zu prüfen).
