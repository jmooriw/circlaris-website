# Prüfprotokoll Fakten-Seite Circlaris

Gilt für `/fakten` und `/en/facts`. Grundlage: Grounding Page Standard 2.0 (groundingpage.com/spec), Abschnitt 8 und 10 des Implementation Guide.

Die Seite zeigt erst dann einen Prüfvermerk und gilt erst dann als konform zu 2.0, wenn eine Prüfung unten vollständig eingetragen ist. Bis dahin gilt sie als Seite nach v1.6.

## Ablauf

1. Eine Person der Circlaris Redaktion liest beide Sprachfassungen vollständig.
2. Sie geht die sieben Prüfpunkte durch und trägt das Ergebnis unten ein.
3. Erst danach wird auf beiden Seiten der Prüfvermerk gesetzt:
   - DE: `Fakten geprüft von Circlaris Redaktion · Zuletzt durch einen Menschen geprüft: <Datum>`
   - EN: `Facts reviewed by Circlaris Redaktion · Last reviewed by a human: <date>`
   - im JSON-LD der WebPage: `"reviewedBy": {"@type": "Organization", "name": "Circlaris Redaktion"}` und `"lastReviewed": "JJJJ-MM-TT"`
   - im HTML-Kommentar im `<head>`: Standard 2.0
4. Das Prüfdatum ändert sich nur durch eine neue, hier eingetragene Prüfung. Deploys, Tippfehler-Korrekturen und automatische Checks ändern es nicht.

## Die sieben Prüfpunkte

1. **Sachliche Richtigkeit:** Stimmt jede Angabe?
2. **Aktualität:** Sind alle Angaben auf dem heutigen Stand? Zeitabhängige Werte haben ein Stand-Datum.
3. **Belegbarkeit und Quellen:** Lässt sich jede Angabe intern belegen (Handelsregister, Verträge, Produkt)?
4. **Identifikation der Entität:** Ist klar, dass die Seite die Software Circlaris beschreibt und die CHH Ventures GmbH als Betreiber?
5. **Konsistenz:** Sagen DE, EN, JSON-LD, Impressum und Startseite dasselbe?
6. **Redaktionelle Freigabe:** Ist die Seite inhaltlich freigegeben?
7. **Referenzen:** Zeigt jede Kennung und jeder Link auf die richtige Entität und ist erreichbar? Derzeit: Website circlaris.com, Handelsregister Amtsgericht Charlottenburg HRB 274797 B. Keine `sameAs`-Profile.

## Ausdrücklich zu bestätigen

Diese Angaben stammen aus der alten Fakten-Seite oder wurden bei der Übernahme geklärt und brauchen eine Bestätigung:

- [ ] Satzungssitz Berlin (laut Handelsregister), Geschäftsanschrift Dieselstr. 13, 50859 Köln
- [ ] Kontakt hello@circlaris.com (die alte Seite nannte hello@circlaris.de), Datenschutz datenschutz@circlaris.com
- [ ] „Seit 2022 im täglichen Einsatz“
- [ ] Hosting in Rechenzentren in Deutschland bei Hetzner
- [ ] Angebundene Kanäle: eBay, Chrono24, Wristler, Kleinanzeigen, Shopware, Shopify
- [ ] Rechnungen in Deutsch und Englisch, E-Rechnung
- [ ] Zusatzmodul Gold und Edelmetalle mit Schmelzpool und Materialverfolgung
- [ ] Auswertungen zu Umsatz, Rohertrag, Marge und Ankaufsvolumen
- [ ] „Die meisten Betriebe arbeiten mit ein bis drei Personen“
- [ ] Bewusst weggelassen gegenüber der alten Seite: „AI-enabled Workflows“ (Produkttexte, Asset-Vorbereitung). Falls zutreffend, mit konkreter Beschreibung ergänzen.
- [ ] Gibt es inzwischen offizielle Profile (LinkedIn, Wikidata)? Dann sichtbar unter „Offizielle Angaben zu Circlaris“ und als `sameAs` ergänzen.

## Abweichungen

Abweichungen bei verlinkten Referenzen nach Fall A bis D behandeln (A falsche Zuordnung: korrigieren oder entfernen; B eigene Angabe an der Quelle veraltet: an der Quelle korrigieren; C echter Widerspruch zu einer unabhängigen Quelle: eigene Angabe belegen und dokumentieren; D scheinbarer Widerspruch: Stand-Datum ergänzen).

## Prüfungen

| Datum | Geprüft von (Person, intern) | Standard | Umfang | Referenzen geprüft | Abweichungen und Behandlung |
|---|---|---|---|---|---|
| | | 2.0 | DE und EN, 7 Punkte | | |
