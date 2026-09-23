// ══ CÓDIGO COMPARTIDO ══
// Lo usan la app (index.html) y el robot de GitHub que genera familia.ics
// para la suscripción de Google Calendar (scripts/generar-ics.js).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CalComun = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const TIPOS = {
    cumple:       { label: 'Cumpleaños',   icon: '🎂', color: '#f72585', anual: true,  aviso: 7 },
    aniversario:  { label: 'Aniversario',  icon: '💍', color: '#7b61ff', anual: true,  aviso: 7 },
    celebracion:  { label: 'Celebración',  icon: '🎉', color: '#fb8500', anual: false, aviso: 7 },
    familiar:     { label: 'Familiar',     icon: '👨‍👩‍👦', color: '#00b87a', anual: false, aviso: 1 },
    recordatorio: { label: 'Recordatorio', icon: '🔔', color: '#e0a100', anual: false, aviso: 1 },
    salud:        { label: 'Médico',       icon: '🩺', color: '#ff3d71', anual: false, aviso: 1 },
    escuela:      { label: 'Colegio',      icon: '🎒', color: '#00a3c4', anual: false, aviso: 1 },
    otro:         { label: 'Otro',         icon: '📌', color: '#64748b', anual: false, aviso: 0 },
  };
  const ZONA = 'Europe/Andorra';
  const RRULE = { anual: 'YEARLY', mensual: 'MONTHLY', semanal: 'WEEKLY' };

  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  const hms = d => pad(d.getHours()) + pad(d.getMinutes()) + '00';
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  function tituloLargo(ev) {
    const t = TIPOS[ev.tipo] || TIPOS.otro;
    return t.icon + ' ' + (ev.tipo === 'cumple' ? 'Cumpleaños de ' + ev.titulo : ev.titulo);
  }
  function descripcion(ev) {
    const nacio = ev.anioConocido ? (ev.tipo === 'cumple' ? 'Nació en ' : 'Desde ') + ev.fecha.slice(0, 4) : '';
    return [ev.persona, ev.notas, nacio].filter(Boolean).join('\n');
  }
  // Inicio y fin en formato iCalendar: día completo (YYYYMMDD) o con hora (YYYYMMDDTHHMMSS, 1 hora)
  function rango(ev) {
    const d = parse(ev.fecha);
    if (!ev.hora) { const fin = new Date(d); fin.setDate(fin.getDate() + 1); return { todoElDia: true, ini: ymd(d), fin: ymd(fin) }; }
    const [hh, mm] = ev.hora.split(':').map(Number);
    const ini = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm), fin = new Date(ini.getTime() + 3600000);
    return { todoElDia: false, ini: ymd(ini) + 'T' + hms(ini), fin: ymd(fin) + 'T' + hms(fin) };
  }

  const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  // Las líneas de un .ics no deben pasar de 75 bytes: se continúan con un espacio
  function fold(line) {
    const bytes = s => new TextEncoder().encode(s).length;
    if (bytes(line) <= 75) return line;
    const out = []; let cur = '';
    for (const ch of line) {
      if (bytes(cur + ch) > (out.length ? 74 : 75)) { out.push(cur); cur = ''; }
      cur += ch;
    }
    out.push(cur);
    return out.join('\r\n ');
  }

  // opts.stamp: fecha fija para DTSTAMP (el robot usa una por semana para no cambiar el archivo cada hora)
  function buildICS(events, opts = {}) {
    const stamp = opts.stamp || new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Familia Diaz Gonzalez//Calendario//ES', 'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH', 'X-WR-CALNAME:Familia Díaz González', 'X-WR-TIMEZONE:' + ZONA,
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H'];
    for (const ev of events) {
      const t = TIPOS[ev.tipo] || TIPOS.otro, r = rango(ev);
      L.push('BEGIN:VEVENT', 'UID:' + ev.id + '@calendario-diaz-gonzalez', 'DTSTAMP:' + stamp);
      if (r.todoElDia) L.push('DTSTART;VALUE=DATE:' + r.ini, 'DTEND;VALUE=DATE:' + r.fin);
      else L.push('DTSTART;TZID=' + ZONA + ':' + r.ini, 'DTEND;TZID=' + ZONA + ':' + r.fin);
      if (RRULE[ev.repite]) L.push('RRULE:FREQ=' + RRULE[ev.repite]);
      L.push('SUMMARY:' + icsEsc(tituloLargo(ev)));
      const desc = descripcion(ev);
      if (desc) L.push('DESCRIPTION:' + icsEsc(desc));
      L.push('CATEGORIES:' + icsEsc(t.label));
      const av = ev.aviso ?? 0;
      // Con hora: X días antes (o 1 h antes). Día completo: a las 9:00, X días antes.
      const trig = !r.todoElDia ? (av ? '-P' + av + 'D' : '-PT1H') : (av ? '-PT' + (av * 24 - 9) + 'H' : 'PT9H');
      L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(ev.titulo), 'TRIGGER:' + trig, 'END:VALARM');
      L.push('END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  // Enlace para añadir un solo evento a Google Calendar al instante
  function googleLink(ev) {
    const r = rango(ev), p = new URLSearchParams({ action: 'TEMPLATE', text: tituloLargo(ev), dates: r.ini + '/' + r.fin, ctz: ZONA });
    const desc = descripcion(ev);
    if (desc) p.set('details', desc);
    if (RRULE[ev.repite]) p.set('recur', 'RRULE:FREQ=' + RRULE[ev.repite]);
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }

  return { TIPOS, buildICS, googleLink };
});
