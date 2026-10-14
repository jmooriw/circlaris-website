// Vercel-Serverfunktion für das Demo-Formular (/demo).
// Keine Abhängigkeiten: nutzt das globale fetch der Node-Laufzeit.
//
// Antworten: 200 ok · 400 invalid · 405 (nur POST) · 500 config · 502 mail

const FIELDS = ['name', 'email', 'company', 'phone', 'current', 'website'];
const REQUIRED = ['name', 'email', 'company'];
const LABELS = {
  name: 'Name',
  email: 'E-Mail',
  company: 'Unternehmen',
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
    return send(res, 405, { error: 'method' });
  }

  const body = readBody(req);
  if (!body) return send(res, 400, { error: 'invalid' });

  const v = {};
  for (const k of FIELDS) {
    const raw = body[k];
    if (raw != null && typeof raw !== 'string') return send(res, 400, { error: 'invalid' });
    v[k] = (raw || '').replace(/\s+/g, ' ').trim(); // alle Felder sind einzeilig
    if (v[k].length > MAX_LEN) return send(res, 400, { error: 'invalid' });
  }

  // Honeypot: Bots füllen das versteckte Feld – still bestätigen, nichts senden.
  if (v.website) return send(res, 200, { ok: true });

  if (REQUIRED.some((k) => !v[k]) || !EMAIL_RE.test(v.email)) {
    return send(res, 400, { error: 'invalid' });
  }

  const { RESEND_API_KEY, DEMO_FROM, DEMO_TO } = process.env;
  if (!RESEND_API_KEY || !DEMO_FROM || !DEMO_TO) {
    console.error('[api/demo] Umgebungsvariablen fehlen');
    return send(res, 500, { error: 'config' });
  }

  const text = [
    ...Object.keys(LABELS).map((k) => `${LABELS[k]}: ${v[k] || '–'}`),
    `Zeitpunkt: ${berlinTimestamp(new Date())}`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: DEMO_FROM,
        to: DEMO_TO.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: v.email,
        subject: `Demo-Anfrage: ${v.company}`,
        text,
      }),
    });
    if (!r.ok) {
      console.error('[api/demo] Resend', r.status, await r.text().catch(() => ''));
      return send(res, 502, { error: 'mail' });
    }
  } catch (err) {
    console.error('[api/demo] Resend nicht erreichbar', err);
    return send(res, 502, { error: 'mail' });
  }

  return send(res, 200, { ok: true });
};
