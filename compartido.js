// ══ CÓDIGO COMPARTIDO ══
// Lo usa la app (index.html): tipos de evento, festivos, vacaciones escolares y el archivo .ics descargable.
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

  // Vacaciones escolares oficiales de Andorra (curs 2026-2027). Cada curso nuevo: añadir sus fechas aquí.
  // Los festivos (Immaculada, Constitució, Festa del Treball) ya salen en festivos().
  const ESCOLAR_COLOR = '#0ea5e9';
  const ESCOLAR = [
    { id: 'esc-2627-totsants',   desde: '2026-10-26', hasta: '2026-11-01', icon: '🍂', titulo: 'Vacaciones de Todos los Santos', aviso: 7 },
    { id: 'esc-2627-nadal',      desde: '2026-12-23', hasta: '2027-01-06', icon: '🎄', titulo: 'Vacaciones de Navidad',          aviso: 7 },
    { id: 'esc-2627-carnaval',   desde: '2027-02-08', hasta: '2027-02-14', icon: '🎭', titulo: 'Vacaciones de Carnaval',         aviso: 7 },
    { id: 'esc-2627-pasqua',     desde: '2027-03-22', hasta: '2027-04-04', icon: '🐣', titulo: 'Vacaciones de Pascua',           aviso: 7 },
    { id: 'esc-2627-pentecosta', desde: '2027-05-17', hasta: '2027-05-23', icon: '🕊️', titulo: 'Vacaciones de Pentecostés',       aviso: 7 },
    { id: 'esc-2627-fi',         desde: '2027-07-02', hasta: '2027-07-02', icon: '🎓', titulo: 'Último día de curso (empiezan las vacaciones de verano)', aviso: 7 },
  ];
  // Días no laborables: festivos nacionales + locales de Andorra la Vella
  // (lista de días inhábiles del Consell General). pais: 'AD' | 'ES' | 'no'
  function pascua(y) { // Algoritmo anónimo gregoriano
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  }
  function festivos(y, pais = 'AD') {
    const out = [], E = pascua(y);
    const add = (d, titulo, icon, local) => out.push({ fecha: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), titulo, icon, local: !!local });
    const rel = n => new Date(E.getFullYear(), E.getMonth(), E.getDate() + n);
    if (pais === 'AD') {
      [[0,1,'Año Nuevo'],[0,6,'Reyes'],[2,14,'Día de la Constitución'],[4,1,'Día del Trabajo'],[7,15,'La Asunción'],
       [8,8,'Nuestra Señora de Meritxell'],[10,1,'Todos los Santos'],[11,8,'La Inmaculada'],[11,25,'Navidad'],[11,26,'San Esteban']]
        .forEach(([m, d, t]) => add(new Date(y, m, d), t, '🇦🇩'));
      add(rel(-48), 'Carnaval', '🎭');
      add(rel(-2), 'Viernes Santo', '🇦🇩');
      add(rel(1), 'Lunes de Pascua', '🇦🇩');
      add(rel(50), 'Lunes de Pentecostés', '🇦🇩');
      const sab = new Date(y, 7, 1 + (6 - new Date(y, 7, 1).getDay() + 7) % 7);   // primer sábado de agosto
      add(new Date(y, 5, 24), 'Sant Joan', '🏛️', true);
      add(new Date(y, 7, sab.getDate() + 2), 'Fiesta Mayor', '🏛️', true);            // el lunes siguiente
      add(new Date(y, 11, 21), 'Santo Tomás', '🏛️', true);
    } else if (pais === 'ES') {
      [[0,1,'Año Nuevo'],[0,6,'Reyes'],[4,1,'Día del Trabajo'],[7,15,'La Asunción'],[9,12,'Fiesta Nacional'],
       [10,1,'Todos los Santos'],[11,6,'Día de la Constitución'],[11,8,'La Inmaculada'],[11,25,'Navidad']]
        .forEach(([m, d, t]) => add(new Date(y, m, d), t, '🇪🇸'));
      add(rel(-3), 'Jueves Santo', '🇪🇸');
      add(rel(-2), 'Viernes Santo', '🇪🇸');
    }
    return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

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
    // Festivos de este año y el siguiente (el robot regenera el archivo cada semana)
    const y0 = opts.anio || new Date().getFullYear();
    if (opts.festivos !== 'no') for (const y of [y0, y0 + 1]) for (const f of festivos(y, opts.festivos || 'AD')) {
      const d = parse(f.fecha), fin = new Date(d); fin.setDate(fin.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:fest-' + f.fecha + '@calendario-diaz-gonzalez', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + ymd(d), 'DTEND;VALUE=DATE:' + ymd(fin),
        'SUMMARY:' + icsEsc(f.icon + ' ' + f.titulo + (f.local ? ' (Andorra la Vella)' : '')),
        'CATEGORIES:' + (f.local ? 'No laborable Andorra la Vella' : 'Festivo nacional'), 'TRANSP:TRANSPARENT', 'END:VEVENT');
    }
    if (opts.escolar !== false) for (const e of ESCOLAR) {
      const fin = parse(e.hasta); fin.setDate(fin.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:' + e.id + '@calendario-diaz-gonzalez', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + e.desde.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + ymd(fin),
        'SUMMARY:' + icsEsc(e.icon + ' ' + e.titulo), 'CATEGORIES:Calendario escolar', 'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(e.titulo), 'TRIGGER:-PT' + (e.aviso * 24 - 9) + 'H', 'END:VALARM',
        'END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  return { TIPOS, ESCOLAR, ESCOLAR_COLOR, festivos, buildICS };
});
