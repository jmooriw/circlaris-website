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
├── api/demo.js             Vercel-Serverfunktion: Demo-Anfrage per Resend versenden
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

Antworten: `200 {"ok":true}`, `400 {"error":"invalid"}` (Pflichtfeld fehlt oder E-Mail ungültig), `500 {"error":"config"}` (Umgebungsvariable fehlt), `502 {"error":"mail"}` (Resend hat abgelehnt oder ist nicht erreichbar). Andere Methoden als POST erhalten `405`.

Die E-Mail ist Klartext mit einer Zeile pro Feld und einem Zeitstempel in Europe/Berlin. Betreff: `Demo-Anfrage: <Unternehmen>`.

### Umgebungsvariablen

In Vercel unter *Project → Settings → Environment Variables* anlegen (Production und Preview):

| Variable         | Beispiel                                   | Zweck |
|------------------|--------------------------------------------|-------|
| `RESEND_API_KEY` | `re_…`                                     | API-Schlüssel aus dem Resend-Dashboard (nur Sendeberechtigung genügt) |
| `DEMO_FROM`      | `Circlaris Website <website@circlaris.com>` | Absender. Die Domain muss in Resend verifiziert sein. |
| `DEMO_TO`        | `hello@circlaris.com`                      | Empfänger. Mehrere Adressen durch Komma trennen. |

### Resend-Domain

Resend versendet nur von verifizierten Domains. Vor dem Livegang:

1. In Resend unter *Domains* die Domain `circlaris.com` (oder eine Subdomain wie `mail.circlaris.com`) hinzufügen.
2. Die angezeigten DNS-Einträge (SPF/MX und DKIM, optional DMARC) beim DNS-Anbieter setzen und warten, bis Resend sie als *Verified* anzeigt.
3. `DEMO_FROM` muss eine Adresse genau dieser Domain verwenden.

Ohne verifizierte Domain klappt nur der Testabsender `onboarding@resend.dev`, und der darf nur an die E-Mail-Adresse des Resend-Kontos senden.

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

`.env.local` und `.vercel/` sind in `.gitignore` eingetragen und gehören nicht ins Repository.

## Deployment

Repository in Vercel importieren. *Framework Preset* „Other“, kein Build Command, Output Directory leer lassen (Projektwurzel). Danach die drei Umgebungsvariablen setzen und die Domain `circlaris.com` verbinden.
