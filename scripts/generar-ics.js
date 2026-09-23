// Lee los eventos de Firebase y escribe:
//  - familia.ics            → suscripción de Google Calendar
//  - backup/eventos.json    → copia de seguridad (el historial de Git guarda todas las versiones)
// Lo ejecuta cada hora .github/workflows/google-calendar.yml
const fs = require('fs');
const path = require('path');
const { buildICS } = require('../compartido.js');

const API = 'https://firestore.googleapis.com/v1/projects/familia-diaz-gonzalez/databases/(default)/documents/calendario_eventos';
const KEY = 'AIzaSyCi0cdF5VqJjcsHibnLg6kvPGVN-f2b_DY';
const RAIZ = path.join(__dirname, '..');

// Firestore REST devuelve cada campo con su tipo: { stringValue: 'x' }, { integerValue: '7' }…
function valor(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(valor);
  if ('mapValue' in v) return campos(v.mapValue.fields || {});
  return null;
}
const campos = f => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valor(v)]));

async function leerEventos() {
  const events = [];
  let token = '';
  do {
    const res = await fetch(`${API}?pageSize=300&key=${KEY}${token ? '&pageToken=' + token : ''}`);
    // Si falla la lectura, no tocar nada: mejor un calendario algo viejo que uno vacío
    if (!res.ok) throw new Error('Error leyendo Firebase: ' + res.status + ' ' + await res.text());
    const page = await res.json();
    for (const d of page.documents || []) events.push(campos(d.fields || {}));
    token = page.nextPageToken || '';
  } while (token);
  return events.sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

(async () => {
  const events = await leerEventos();
  const publicos = events.map(({ updatedAt, updatedBy, ...ev }) => ev);

  // DTSTAMP fijo por semana (lunes): el archivo solo cambia cuando cambian los eventos,
  // y al menos una vez por semana para que GitHub no desactive el robot por inactividad
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const stamp = d.toISOString().slice(0, 10).replace(/-/g, '') + 'T000000Z';
  fs.writeFileSync(path.join(RAIZ, 'familia.ics'), buildICS(publicos, { stamp }));

  // Copia en el mismo formato que "Descargar copia de seguridad" → se puede restaurar desde la app
  fs.mkdirSync(path.join(RAIZ, 'backup'), { recursive: true });
  fs.writeFileSync(path.join(RAIZ, 'backup', 'eventos.json'), JSON.stringify({ events: publicos }, null, 2) + '\n');

  console.log('Listo:', events.length, 'eventos');
})().catch(e => { console.error(e); process.exit(1); });
