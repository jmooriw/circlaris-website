// Vercel-Serverfunktion für das Demo-Formular (/demo).
// Keine Abhängigkeiten: nutzt das globale fetch der Node-Laufzeit.
// Versand über die MailerSend-API, Token nur aus den Vercel-Umgebungsvariablen.
//
// Antworten: 200 {ok:true} · 400 {ok:false,error} · 405 (nur POST) · 500 config · 502 mail

const FIELDS = ['name', 'email', 'company', 'phone', 'current', 'website'];
const REQUIRED = ['name', 'email', 'company'];
const LABELS = {
  name: 'Name',
  company: 'Unternehmen',
  email: 'E-Mail',
  phone: 'Telefon',
  current: 'Heute im Einsatz',
};
const MAX_LEN = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  // Vercel parst JSON-Bodies selbst; ein kaputter Body wirft beim Zugriff.
  try {
    const b = req.body;
    if (typeof b === 'string') return JSON.parse(b);
    return b && typeof b === 'object' ? b : null;
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function berlinTimestamp(date) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(date) + ' (Europe/Berlin)';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Nur POST erlaubt.' });
  }

  const body = readBody(req);
  if (!body) return send(res, 400, { ok: false, error: 'Ungültiger JSON-Body.' });

  const v = {};
  for (const k of FIELDS) {
    const raw = body[k];
    if (raw != null && typeof raw !== 'string') return send(res, 400, { ok: false, error: `Feld ${k} ist ungültig.` });
    v[k] = (raw || '').replace(/\s+/g, ' ').trim(); // alle Felder sind einzeilig
    if (v[k].length > MAX_LEN) return send(res, 400, { ok: false, error: `Feld ${k} ist zu lang.` });
  }

  // Honeypot: Bots füllen das versteckte Feld – still bestätigen, nichts senden.
  if (v.website) return send(res, 200, { ok: true });

  const missing = REQUIRED.filter((k) => !v[k]);
  if (missing.length) return send(res, 400, { ok: false, error: `Pflichtfelder fehlen: ${missing.join(', ')}.` });
  if (!EMAIL_RE.test(v.email)) return send(res, 400, { ok: false, error: 'E-Mail-Adresse ist ungültig.' });

  const { MAILERSEND_TOKEN, DEMO_FROM, DEMO_TO } = process.env;
  const missingEnv = ['MAILERSEND_TOKEN', 'DEMO_FROM', 'DEMO_TO'].filter((k) => !process.env[k]);
  if (missingEnv.length) {
    console.error(`[api/demo] Umgebungsvariablen fehlen: ${missingEnv.join(', ')}`);
    return send(res, 500, { ok: false });
  }

  const stamp = berlinTimestamp(new Date());
  const rows = [...Object.keys(LABELS).map((k) => [LABELS[k], v[k] || '–']), ['Zeitpunkt', stamp]];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html =
    '<table cellpadding="6" cellspacing="0" border="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">' +
    rows.map(([label, value]) =>
      `<tr><th align="left" valign="top" style="padding-right:16px;">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
    ).join('') +
    '</table>';

  try {
    const r = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAILERSEND_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: DEMO_FROM, name: 'Circlaris Website' },
        to: [{ email: DEMO_TO }],
        reply_to: { email: v.email, name: v.name },
        subject: `Demo-Anfrage von ${v.name}, ${v.company}`,
        text,
        html,
      }),
    });
    if (!r.ok) {
      console.error('[api/demo] MailerSend', r.status, await r.text().catch(() => ''));
      return send(res, 502, { ok: false });
    }
  } catch (err) {
    console.error('[api/demo] MailerSend nicht erreichbar', err);
    return send(res, 502, { ok: false });
  }

  return send(res, 200, { ok: true });
};
