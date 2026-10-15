# circlaris.com

Statische Website von Circlaris mit einer Serverfunktion für das Demo-Formular. Gehostet auf Vercel, ohne Build-Schritt und ohne npm-Abhängigkeiten.

## Struktur

```
.
├── index.html              Startseite            → /
├── demo/index.html         Demo anfragen         → /demo
├── impressum/index.html    Impressum             → /impressum
├── datenschutz/index.html  Datenschutzerklärung  → /datenschutz
├── styles.css              Gemeinsame Styles: Schriften, Design-Tokens, Resets, Nav, Footer
├── assets/
│   ├── *.webp, *.jpg, *.png, *.svg   Bilder, Logos, Favicon, Apple-Touch-Icon
│   ├── fonts/*.woff2                 EB Garamond und Figtree, selbst gehostet
│   └── js/
│       ├── dc-runtime.js             Laufzeit, die die Seitenvorlagen rendert (aus Claude Design)
│       ├── react.production.min.js   React 18.3.1 (UMD), lokal statt CDN
│       └── react-dom.production.min.js
├── api/demo.js             Vercel-Serverfunktion: Demo-Anfrage per MailerSend versenden
├── vercel.json             cleanUrls, keine abschließenden Schrägstriche
└── CLAUDE.md               Regeln für spätere Änderungen
```

Jede Seite ist eine Vorlage im `<x-dc>`-Block, die `assets/js/dc-runtime.js` im Browser mit React rendert. Texte stehen direkt im HTML, Seitenlogik (Menü, Formular, Animationen) im `<script type="text/x-dc">` am Ende jeder Seite. Platzhalter wie `{{ menuOpen }}` kommen aus `renderVals()` in diesem Script.

Alle Schriften, Bilder und Skripte werden von der eigenen Domain geladen. Es gibt keine Anfragen an Google Fonts oder CDNs.

## Demo-Formular

`/demo` sendet `POST /api/demo` mit JSON:

| Feld      | Pflicht | Bedeutung                                         |
|-----------|---------|---------------------------------------------------|
| `name`    | ja      | Name                                              |
| `email`   | ja      | E-Mail, wird als `reply_to` gesetzt               |
| `company` | ja      | Unternehmen, steht im Betreff                     |
| `phone`   | nein    | Telefon                                           |
| `current` | nein    | „Was nutzen Sie heute für Ankauf und Verkauf?“    |
| `website` | –       | Honeypot. Ist es gefüllt, antwortet die Funktion mit 200 und versendet nichts. |

Antworten: `200 {"ok":true}`, `400 {"ok":false,"error":"…"}` (Pflichtfeld fehlt oder E-Mail ungültig), `405` für andere Methoden als POST, `500 {"ok":false}` (Umgebungsvariable fehlt, Details nur im Log), `502 {"ok":false}` (MailerSend hat abgelehnt oder ist nicht erreichbar; Status und Antwort stehen im Log).

Die E-Mail enthält alle Felder und einen Zeitstempel in Europe/Berlin, als Text (eine Zeile pro Feld) und als HTML-Tabelle. Betreff: `Demo-Anfrage von <Name>, <Unternehmen>`. `reply_to` ist die Adresse aus dem Formular.

### Umgebungsvariablen

In Vercel unter *Project → Settings → Environment Variables* anlegen (Production und Preview). Vorlage ohne Werte: `.env.example`.

| Variable           | Beispiel                  | Zweck |
|--------------------|---------------------------|-------|
| `MAILERSEND_TOKEN` | `mlsn.…`                  | API-Token aus MailerSend (Berechtigung „Email: Full access“ genügt) |
| `DEMO_FROM`        | `website@circlaris.de`    | Absenderadresse. Muss zur verifizierten Domain `circlaris.de` gehören. Der Anzeigename „Circlaris Website“ ist im Code gesetzt. |
| `DEMO_TO`          | `hello@circlaris.com`     | Empfänger |

### MailerSend-Domain

MailerSend versendet nur von verifizierten Domains. Verifiziert ist `circlaris.de` (SPF, DKIM, Return-Path im DNS). `DEMO_FROM` muss eine Adresse dieser Domain sein.

## Lokal testen

Voraussetzung: Node.js 18 oder neuer und die Vercel CLI.

```bash
npm i -g vercel
```

Einmalig das Projekt verknüpfen und die Umgebungsvariablen holen (alternativ `.env.local` von Hand mit den drei Variablen anlegen):

```bash
vercel link
```

```bash
vercel env pull .env.local
```

Server starten. Er läuft unter http://localhost:3000, mit denselben sauberen URLs und derselben `/api/demo` wie in Produktion:

```bash
vercel dev
```

Formular per Kommandozeile testen:

```bash
curl -i -X POST http://localhost:3000/api/demo -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@example.com","company":"Testfirma","phone":"","current":"Excel","website":""}'
```

`.env`, `.env.local` und `.vercel/` sind in `.gitignore` eingetragen und gehören nicht ins Repository.

## Deployment

Repository in Vercel importieren. *Framework Preset* „Other“, kein Build Command, Output Directory leer lassen (Projektwurzel). Danach die drei Umgebungsvariablen setzen und die Domain `circlaris.com` verbinden.
