# Regeln für Änderungen an circlaris.com

Statische Website auf Vercel. Struktur und lokaler Test: siehe README.md.

Der Übertrag aus Claude Design ist abgeschlossen, das Repository ist die einzige Quelle. `styleguide.html` zeigt Tokens und Komponenten, lädt `styles.css` und muss bei Änderungen daran nicht angepasst werden.

## Grundregeln

- **Tokens nur in `styles.css`.** Farben, Schriften, Schriftgrößen, Abstände, Radien, Schatten und Breakpoint-Variablen werden ausschließlich im `:root` von `styles.css` definiert oder geändert. In den Seiten nur `var(--…)` verwenden, keine neuen Hex-Werte oder Pixelmaße für Dinge, die es als Token gibt. Seitenspezifische Layout-Schalter (z. B. `--demo-*` in `demo/index.html`) dürfen im `<style>` der jeweiligen Seite bleiben.
- **Texte nur in den HTML-Dateien.** Inhalte stehen im Markup der jeweiligen Seite, nicht in `styles.css` (kein `content: "…"` für Text) und nicht in neuen JS-Dateien. Vorhandene Texte im Seiten-Script (z. B. Fehlermeldungen im Demo-Formular) bleiben dort.
- **Keine Build-Tools.** Kein npm, kein Bundler, kein Framework, keine `package.json`. Dateien werden so ausgeliefert, wie sie im Repository liegen. `api/demo.js` bleibt ohne Abhängigkeiten.
- **Bilder als WebP unter `assets/`.** Neue oder ersetzte Bilder als `.webp`, in sinnvoller Größe (maximal etwa doppelte Anzeigebreite), mit sprechendem Dateinamen in Kleinbuchstaben mit Bindestrichen. Keine `data:`-URIs in den Seiten. Bestehende JPG/PNG beim nächsten Austausch nach WebP überführen und alle Verweise anpassen.
- **Sie-Anrede.** Alle Texte siezen die Leserin und den Leser, konsequent, auch in Fehlermeldungen, Buttons und Alt-Texten.
- **Keine Preise auf der Seite.** Keine Beträge, Pakete, Rabatte oder „ab … €“, auch nicht in Meta-Tags, Alt-Texten oder Kommentaren.

## Technische Hinweise

- Jede Seite ist eine Vorlage im `<x-dc>`-Block und wird von `assets/js/dc-runtime.js` mit React gerendert. Dabei gelten folgende Sonderattribute:
  - `{{ name }}` setzt Werte aus `renderVals()` im `<script type="text/x-dc">` derselben Seite ein.
  - `<sc-if>` und `<sc-for>` steuern Bedingungen und Schleifen.
  - `style-hover`, `style-focus-visible` und `style-active` setzen Zustands-Styles.
  - `sc-camel-*` steht für camelCase-Attribute wie `viewBox` oder `onClick`.
  Diese Syntax beibehalten.
- `assets/js/dc-runtime.js`, `react.production.min.js` und `react-dom.production.min.js` nicht bearbeiten.
- Pfade immer absolut ab Wurzel: `/assets/…`, `/styles.css`, Links als `/demo`, `/impressum`, `/datenschutz`, `/#abschnitt`, ohne abschließenden Schrägstrich und ohne `.html`.
- Keine externen Ressourcen einbinden (Google Fonts, CDNs, Tracking). Alles wird von der eigenen Domain geladen. Kommt doch ein Drittanbieter hinzu, muss die Datenschutzerklärung angepasst werden.
- Das Copyright-Jahr im Footer setzt `renderVals()` automatisch (`copyright`). Nicht von Hand eintragen.
- Jede Seite bleibt unter 300 KB.
- Navigation und Footer sind in allen vier Seiten identisch. Eine Änderung dort in allen vier Dateien gleich vornehmen.
- Nach Änderungen alle vier Seiten bei 1440 px und 390 px Breite ansehen, lokal mit `vercel dev`.
- Das Demo-Formular sendet an `/api/demo`. Feldnamen (`name`, `email`, `company`, `phone`, `current`, `website`) in Formular und Funktion nur gemeinsam ändern.

## Demo-Anfrage

- Ablauf: Formular auf `/demo` → `fetch` mit JSON an `POST /api/demo` (`api/demo.js`) → MailerSend-API (`https://api.mailersend.com/v1/email`) → E-Mail an das Team.
- In Vercel (Production und Preview) müssen gesetzt sein: `MAILERSEND_TOKEN`, `DEMO_FROM`, `DEMO_TO`. Vorlage ohne Werte: `.env.example`. Fehlt eine Variable, antwortet die Funktion mit 500 und nennt die fehlende Variable nur im Log.
- Verifizierte Versanddomain in MailerSend ist `circlaris.de`; `DEMO_FROM` muss eine Adresse dieser Domain sein. Ziel der Anfragen ist `hello@circlaris.com` (`DEMO_TO`). Antworten gehen per `reply_to` direkt an die anfragende Person.
- Der MailerSend-Token gehört niemals ins Repository, auch nicht in `.env.example`, README oder Kommentare. `.env` und `.env.local` sind in `.gitignore`.
- Ein Wechsel des Mail-Anbieters erfordert eine Anpassung der Datenschutzerklärung (Abschnitt 2.2).
