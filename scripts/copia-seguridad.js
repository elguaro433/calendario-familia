// Lee los eventos de Firebase (familias/<id>/appdata/calendario-eventos) y escribe backup/eventos.json.
// El historial de Git guarda todas las versiones. Lo ejecuta .github/workflows/copia-seguridad.yml
const fs = require('fs');
const path = require('path');

// Los datos están en familias/<id>/appdata; <id> sale de la clave familiar y va en el secreto FAM_ID de GitHub
if (!/^[0-9a-f]{64}$/.test(process.env.FAM_ID || '')) { console.error('Falta el secreto FAM_ID (Settings → Secrets and variables → Actions)'); process.exit(1); }
const DOC_URL = 'https://firestore.googleapis.com/v1/projects/familia-diaz-gonzalez/databases/(default)/documents/familias/' + process.env.FAM_ID + '/appdata/calendario-eventos?key=AIzaSyCi0cdF5VqJjcsHibnLg6kvPGVN-f2b_DY';
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
  // Sin los números de WhatsApp ni los mensajes propios: este repositorio es público y la copia se ve en GitHub
  const events = Object.values(campos(doc.fields || {}).eventos || {})
    .map(({ telefono, mensaje, ...resto }) => resto)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // "semana" cambia cada lunes: así hay al menos un commit semanal y GitHub no desactiva
  // el robot por inactividad (60 días)
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const copia = { semana: d.toISOString().slice(0, 10), events };

  // Mismo formato que "Descargar copia de seguridad" → se puede restaurar desde la app
  fs.mkdirSync(path.join(RAIZ, 'backup'), { recursive: true });
  fs.writeFileSync(path.join(RAIZ, 'backup', 'eventos.json'), JSON.stringify(copia, null, 2) + '\n');

  // Calendario de suscripción (webcal://…/calendario.ics) para el Calendario del iPhone.
  // DTSTAMP fijo por semana: el archivo solo cambia cuando cambian los eventos (o cada lunes).
  const { buildICS } = require(path.join(RAIZ, 'compartido.js'));
  fs.writeFileSync(path.join(RAIZ, 'calendario.ics'), buildICS(events.filter(e => !e.soloElibel), { stamp: copia.semana.replace(/-/g, '') + 'T000000Z' }));
  // El de Elibel: sin los eventos «Solo en mi app» de Emmanuel y con sus días para felicitarlo (Día del Padre, del Hombre…)
  fs.writeFileSync(path.join(RAIZ, 'calendario-elibel.ics'), buildICS(events.filter(e => !e.privado), { pareja: 'emmanuel', stamp: copia.semana.replace(/-/g, '') + 'T000000Z' }));
  console.log('Copia guardada:', events.length, 'eventos (y calendario.ics / calendario-elibel.ics)');
})().catch(e => { console.error(e); process.exit(1); });
