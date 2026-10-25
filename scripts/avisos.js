// Avisos al móvil (Web Push): cada mañana mira qué toca y lo manda a los móviles que activaron
// «Avisos en este móvil» en Ajustes. Lo ejecuta .github/workflows/avisos.yml.
// Necesita el secreto VAPID_PRIVATE en GitHub. Sin él solo muestra lo que mandaría (prueba).
const webpush = require('web-push');

// Los datos están en familias/<id>/appdata; <id> sale de la clave familiar y va en el secreto FAM_ID de GitHub
if (!/^[0-9a-f]{64}$/.test(process.env.FAM_ID || '')) { console.error('Falta el secreto FAM_ID (Settings → Secrets and variables → Actions)'); process.exit(1); }
const BASE = 'https://firestore.googleapis.com/v1/projects/familia-diaz-gonzalez/databases/(default)/documents/familias/' + process.env.FAM_ID + '/appdata/';
const KEY = '?key=AIzaSyCi0cdF5VqJjcsHibnLg6kvPGVN-f2b_DY';
const VAPID_PUBLIC = 'BBG1E9azGZnY5FuFTCoHGk2AtWIObIpHKhutZrkKXlq6mSVq3l_BjW40u08bd2sa0vW0A7F7X-ulhEgl6TqbFlQ';
const APP = 'https://elguaro433.github.io/calendario-familia/';
const ICONOS = { cumple: '🎂', aniversario: '💍', celebracion: '🎉', familiar: '👨‍👩‍👧‍👦', recordatorio: '📌', salud: '🩺', escuela: '🎒', recuerdo: '🕊️', otro: '📅' };

function valor(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(valor);
  if ('mapValue' in v) return campos(v.mapValue.fields || {});
  return null;
}
const campos = f => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valor(v)]));
async function leer(doc) {
  const res = await fetch(BASE + doc + KEY);
  if (res.status === 404) return {};
  if (!res.ok) throw new Error('Error leyendo ' + doc + ': ' + res.status + ' ' + await res.text());
  return campos((await res.json()).fields || {});
}

// Fechas en hora de Andorra, a medianoche (UTC) para contar días sin líos de horario de verano
const hoyAndorra = () => { const s = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Andorra' }); return new Date(s + 'T00:00:00Z'); };
const DIA = 86400000;
const diasEn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const fechaUTC = (y, m, d) => new Date(Date.UTC(y, m, Math.min(d, diasEn(y, m))));

// Próxima vez que pasa el evento desde hoy (o null si ya pasó / no se repite)
function proxima(ev, hoy) {
  const [y, m, d] = ev.fecha.split('-').map(Number), base = new Date(Date.UTC(y, m - 1, d));
  if (base >= hoy) return base;
  if (ev.repite === 'anual') { const f = fechaUTC(hoy.getUTCFullYear(), m - 1, d); return f >= hoy ? f : fechaUTC(hoy.getUTCFullYear() + 1, m - 1, d); }
  if (ev.repite === 'mensual') { const f = fechaUTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), d); return f >= hoy ? f : fechaUTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, d); }
  if (ev.repite === 'semanal') return new Date(base.getTime() + Math.ceil((hoy - base) / (7 * DIA)) * 7 * DIA);
  return null;
}

// Avisa el mismo día, el día antes y los días de antelación que tenga el evento («Avisarme»)
function avisosDeHoy(eventos, hoy) {
  const out = [];
  for (const ev of eventos) {
    const f = proxima(ev, hoy);
    if (!f) continue;
    const n = Math.round((f - hoy) / DIA), aviso = ev.aviso ?? 0;
    if (!(n === 0 || n === 1 || (n === aviso && n > 1))) continue;
    const cuando = n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : 'Dentro de ' + n + ' días';
    const icono = ICONOS[ev.tipo] || ICONOS.otro;
    const edad = ev.anioConocido && ev.repite === 'anual' ? f.getUTCFullYear() - Number(ev.fecha.slice(0, 4)) : null;
    const felicitar = ev.tipo === 'cumple' || (ev.tipo === 'aniversario' && /boda|casad/i.test(ev.titulo));
    const title = ev.tipo === 'cumple'
      ? `${icono} ${cuando} cumple ${ev.titulo}${edad ? ' (' + edad + ')' : ''}`
      : `${icono} ${cuando}: ${ev.titulo}${edad && ev.tipo === 'aniversario' ? ' (' + edad + ' años)' : ''}`;
    const body = felicitar && n === 0 ? 'Toca para felicitar por WhatsApp' : [ev.hora && 'A las ' + ev.hora, ev.persona].filter(Boolean).join(' · ') || 'Toca para verlo en el calendario';
    out.push({ title, body, tag: ev.id + '-' + f.toISOString().slice(0, 10), url: APP + '?evento=' + encodeURIComponent(ev.id) });
  }
  return out;
}

(async () => {
  const hoy = hoyAndorra();
  const eventos = Object.values((await leer('calendario-eventos')).eventos || {});
  const avisos = avisosDeHoy(eventos, hoy);
  const subs = (await leer('calendario-avisos')).subs || {};
  console.log(hoy.toISOString().slice(0, 10) + ':', avisos.length, 'avisos para', Object.keys(subs).length, 'móviles');
  avisos.forEach(a => console.log(' -', a.title, '|', a.body));
  if (!avisos.length) return;
  if (!process.env.VAPID_PRIVATE) { console.log('Sin VAPID_PRIVATE: no se envía nada (prueba).'); return; }

  webpush.setVapidDetails(APP, VAPID_PUBLIC, process.env.VAPID_PRIVATE);
  const caducadas = [];
  for (const [id, s] of Object.entries(subs)) {
    for (const a of avisos) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(a), { TTL: 12 * 3600 });
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) { caducadas.push(id); break; }   // ese móvil ya no acepta avisos
        console.warn('No se pudo avisar a', id, e.statusCode || e.message);
      }
    }
  }
  // Quitar los móviles que ya no reciben (PATCH con máscara del campo y sin valor = borrarlo)
  if (caducadas.length) {
    const q = caducadas.map(id => 'updateMask.fieldPaths=' + encodeURIComponent('subs.`' + id + '`')).join('&');
    const res = await fetch(BASE + 'calendario-avisos' + KEY + '&' + q, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: {} }) });
    console.log('Quitados', caducadas.length, 'móviles caducados:', res.status);
  }
})().catch(e => { console.error(e); process.exit(1); });
