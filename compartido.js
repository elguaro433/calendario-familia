// ══ CÓDIGO COMPARTIDO ══
// Lo usa la app (index.html): tipos de evento, festivos, vacaciones escolares y el archivo .ics descargable.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CalComun = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const TIPOS = {
    cumple:       { label: 'Cumpleaños',   icon: '🎂', color: '#d9528b', anual: true,  aviso: 7 },
    aniversario:  { label: 'Aniversario',  icon: '💍', color: '#7c5cc4', anual: true,  aviso: 7 },
    celebracion:  { label: 'Celebración',  icon: '🎉', color: '#e27a45', anual: false, aviso: 7 },
    familiar:     { label: 'Familiar',     icon: '👨‍👩‍👦', color: '#2f9e78', anual: false, aviso: 1 },
    recordatorio: { label: 'Recordatorio', icon: '🔔', color: '#c9962b', anual: false, aviso: 1 },
    salud:        { label: 'Médico',       icon: '🩺', color: '#1f9aa3', anual: false, aviso: 1 },
    escuela:      { label: 'Colegio',      icon: '🎒', color: '#4a7fd6', anual: false, aviso: 1 },
    recuerdo:     { label: 'En memoria',   icon: '🕊️', color: '#9c8fb8', anual: true,  aviso: 7 },
    otro:         { label: 'Otro',         icon: '📌', color: '#7a7f91', anual: false, aviso: 0 },
  };
  const ZONA = 'Europe/Andorra';

  // Vacaciones escolares oficiales de Andorra (curs 2026-2027). Cada curso nuevo: añadir sus fechas aquí.
  // Los festivos (Immaculada, Constitució, Festa del Treball) ya salen en festivos().
  const ESCOLAR_COLOR = '#3fa7d6';
  const ESCOLAR = [
    { id: 'esc-2627-estiu',      desde: '2026-09-01', hasta: '2026-09-08', icon: '🏫', titulo: 'Vacaciones escolares',          aviso: 7 },
    { id: 'esc-2627-totsants',   desde: '2026-10-26', hasta: '2026-11-01', icon: '🏫', titulo: 'Vacaciones escolares', aviso: 7 },
    { id: 'esc-2627-nadal',      desde: '2026-12-23', hasta: '2027-01-06', icon: '🏫', titulo: 'Vacaciones escolares',          aviso: 7 },
    { id: 'esc-2627-carnaval',   desde: '2027-02-08', hasta: '2027-02-14', icon: '🏫', titulo: 'Vacaciones escolares',         aviso: 7 },
    { id: 'esc-2627-pasqua',     desde: '2027-03-22', hasta: '2027-04-04', icon: '🏫', titulo: 'Vacaciones escolares',           aviso: 7 },
    { id: 'esc-2627-pentecosta', desde: '2027-05-17', hasta: '2027-05-23', icon: '🏫', titulo: 'Vacaciones escolares',       aviso: 7 },
    { id: 'esc-2627-fi',         desde: '2027-07-02', hasta: '2027-07-02', icon: '🎓', titulo: 'Último día de curso (empiezan las vacaciones de verano)', aviso: 7 },
    // Verano: hasta Meritxell (8/9); se vuelve a clase el 9/9/2027 (a confirmar con el PDF del curso 2027-2028)
    { id: 'esc-2627-verano',     desde: '2027-07-03', hasta: '2027-09-08', icon: '🏫', titulo: 'Vacaciones escolares',          aviso: 7 },
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

  // Celebraciones de la familia (no son festivos): se calculan solas para cualquier año
  const CELEB_COLOR = '#e27a45';
  function domingo(y, mes, n) {            // n-ésimo domingo del mes (mes 0-11)
    const d = new Date(y, mes, 1);
    return new Date(y, mes, 1 + (7 - d.getDay()) % 7 + 7 * (n - 1));
  }
  function celebraciones(y) {
    const out = [];
    const add = (d, titulo, icon) => out.push({ fecha: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), titulo, icon, celeb: true });
    add(new Date(y, 1, 14), 'Día del Amor y la Amistad', '❤️');
    add(new Date(y, 2, 8), 'Día de la Mujer (Venezuela y Andorra)', '💐');
    add(new Date(y, 2, 19), 'Día del Padre (Andorra)', '👨');
    add(new Date(y, 2, 21), 'Día de las Flores Amarillas (primavera)', '🌼');
    add(new Date(y, 8, 21), 'Día de las Flores Amarillas', '🌼');
    add(domingo(y, 4, 1), 'Día de la Madre (Andorra)', '👩');
    add(domingo(y, 4, 2), 'Día de la Madre (Venezuela)', '👩');
    add(new Date(y, 4, 12), 'Día de la Enfermera (Venezuela y Andorra)', '👩‍⚕️');
    add(domingo(y, 5, 3), 'Día del Padre (Venezuela)', '👨');
    add(new Date(y, 6, 16), 'Virgen del Carmen (felicitar a Elibel del Carmen)', '🌸');
    add(domingo(y, 6, 3), 'Día del Niño (Venezuela)', '🧒');
    return out;
  }

  // Estaciones (equinoccios y solsticios, a la hora de Andorra) y cambios de hora de la UE
  const EST_COLOR = '#7a9a45';
  // Fórmulas de Meeus (Astronomical Algorithms, cap. 27): error de ~1 minuto entre los años 2000 y 3000
  const MEEUS_C = [[2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],    // marzo
                   [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],     // junio
                   [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],     // septiembre
                   [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]];   // diciembre
  const MEEUS_S = [[485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186], [182, 27.85, 445267.112],
    [156, 73.14, 45036.886], [136, 171.52, 22518.443], [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
    [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226], [45, 247.54, 29929.562], [44, 325.15, 31555.956],
    [29, 60.93, 4443.417], [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029], [14, 199.76, 31436.921],
    [12, 95.39, 14577.848], [12, 287.11, 31931.756], [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074]];
  function momentoEstacion(y, i) {           // i: 0 primavera, 1 verano, 2 otoño, 3 invierno → instante (Date)
    const Y = (y - 2000) / 1000, c = MEEUS_C[i], rad = Math.PI / 180;
    const jde0 = c[0] + c[1] * Y + c[2] * Y ** 2 + c[3] * Y ** 3 + c[4] * Y ** 4;
    const T = (jde0 - 2451545) / 36525, W = (35999.373 * T - 2.47) * rad;
    const S = MEEUS_S.reduce((s, [a, b, k]) => s + a * Math.cos((b + k * T) * rad), 0);
    const jde = jde0 + 0.00001 * S / (1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));
    return new Date((jde - 2440587.5) * 86400000 - 69000);   // tiempo dinámico → UTC (ΔT ≈ 69 s)
  }
  const horaAndorra = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const ultimoDomingo = (y, mes) => { const d = new Date(y, mes + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; };
  function estaciones(y) {
    const out = [];
    [['🌸', 'Empieza la primavera', 'Equinoccio'], ['☀️', 'Empieza el verano', 'Solsticio', 'el día más largo del año'],
     ['🍂', 'Empieza el otoño', 'Equinoccio'], ['❄️', 'Empieza el invierno', 'Solsticio', 'la noche más larga del año']]
      .forEach(([icon, titulo, que, extra], i) => {
        const p = Object.fromEntries(horaAndorra.formatToParts(momentoEstacion(y, i).getTime() + 30000).map(x => [x.type, x.value]));
        out.push({ fecha: `${p.year}-${p.month}-${p.day}`, titulo, icon, estacion: true, aviso: 0,
                   nota: `${que}, a las ${p.hour}:${p.minute} h` + (extra ? ' · ' + extra : '') });
      });
    const add = (d, titulo, nota) => out.push({ fecha: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), titulo, icon: '⏰', estacion: true, aviso: 3, nota });
    add(ultimoDomingo(y, 2), 'Cambio de hora (+1 hora)', 'La madrugada del domingo, a las 2:00 serán las 3:00: se duerme una hora menos');
    add(ultimoDomingo(y, 9), 'Cambio de hora (−1 hora)', 'La madrugada del domingo, a las 3:00 volverán a ser las 2:00: se duerme una hora más');
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

  return { TIPOS, ESCOLAR, ESCOLAR_COLOR, CELEB_COLOR, EST_COLOR, festivos, celebraciones, estaciones, buildICS };
});
