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

## Daten

`src/markets.ts` enthält ausschließlich synthetische Beispieldaten. Sie sind in der UI als **Demo** markiert und dürfen nicht als echte Veranstaltungstermine interpretiert werden. Vor einem öffentlichen Produktlaunch wird eine verifizierte Live-Datenquelle angebunden.

## Sicherheit

Es werden keine Secrets benötigt. `.env*` ist standardmäßig ignoriert; `.env.example` dokumentiert nur Variablennamen.
