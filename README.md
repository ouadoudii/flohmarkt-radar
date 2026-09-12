# Fundstück

Mobile-first Flohmarkt-Finder für regionale Termine. Der MVP läuft ohne Login und ohne kostenpflichtige APIs.

## MVP

- Suche nach Ort, PLZ, Marktname und Sortiment
- Zeitraumfilter für alle Termine, heute und Wochenende
- optionale Standortfreigabe plus Umkreisfilter
- Favoriten lokal auf dem Gerät, mit In-Memory-Fallback bei blockiertem Browser-Speicher
- Detailansicht mit Routen-Link
- klare Empty States und Demo-Kennzeichnung
- responsive Oberfläche mit Desktop- und Mobile-Browsertests

## Entwicklung

```bash
npm install
npx playwright install chromium
npm run quality
```

Der CI-Workflow **Factory Quality Gate** prüft Typecheck, Lint, Unit-Tests, Dependency Audit, Production Build und reale Chromium-Flows auf Desktop und Mobile.

## Deployment

Das Vercel-Projekt ist per Git-Integration mit `ouadoudii/flohmarkt-radar` verbunden. Produktionsdeployments werden aus dem grünen `main`-Stand erzeugt.

Deployment-Synchronisierung am 12. September 2026 erneut über einen vollständig geprüften Pull Request angestoßen, weil der aktuelle `main`-Commit einem älteren READY-Production-Deployment vorauslief.

## Daten

`src/markets.ts` enthält synthetische Beispieldaten und zusätzlich explizit verifizierte Termine mit Quellenangabe. Demo-Einträge sind in der UI als **Demo** markiert und dürfen nicht mit den verifizierten Veranstaltungsterminen verwechselt werden.

## Sicherheit

Es werden keine Secrets benötigt. `.env*` ist standardmäßig ignoriert; `.env.example` dokumentiert nur Variablennamen.
