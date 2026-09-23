// Lee los eventos de Firebase (appdata/calendario-eventos) y escribe backup/eventos.json.
// El historial de Git guarda todas las versiones. Lo ejecuta .github/workflows/copia-seguridad.yml
const fs = require('fs');
const path = require('path');

const DOC_URL = 'https://firestore.googleapis.com/v1/projects/familia-diaz-gonzalez/databases/(default)/documents/appdata/calendario-eventos?key=AIzaSyCi0cdF5VqJjcsHibnLg6kvPGVN-f2b_DY';
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

(async () => {
  const res = await fetch(DOC_URL);
  // Si falla la lectura, no tocar nada: la copia anterior sigue siendo válida
  if (!res.ok) throw new Error('Error leyendo Firebase: ' + res.status + ' ' + await res.text());
  const doc = await res.json();
  const events = Object.values(campos(doc.fields || {}).eventos || {}).sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // "semana" cambia cada lunes: así hay al menos un commit semanal y GitHub no desactiva
  // el robot por inactividad (60 días)
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const copia = { semana: d.toISOString().slice(0, 10), events };

  // Mismo formato que "Descargar copia de seguridad" → se puede restaurar desde la app
  fs.mkdirSync(path.join(RAIZ, 'backup'), { recursive: true });
  fs.writeFileSync(path.join(RAIZ, 'backup', 'eventos.json'), JSON.stringify(copia, null, 2) + '\n');
  console.log('Copia guardada:', events.length, 'eventos');
})().catch(e => { console.error(e); process.exit(1); });
