// Lee los eventos de Firebase y escribe familia.ics (suscripción de Google Calendar).
// Lo ejecuta cada hora .github/workflows/google-calendar.yml
const fs = require('fs');
const path = require('path');
const { buildICS } = require('../compartido.js');

const DOC_URL = 'https://firestore.googleapis.com/v1/projects/familia-diaz-gonzalez/databases/(default)/documents/appdata/calendario-diaz-gonzalez?key=AIzaSyCi0cdF5VqJjcsHibnLg6kvPGVN-f2b_DY';

(async () => {
  const res = await fetch(DOC_URL);
  let events = [];
  if (res.status === 404) {
    console.log('Aún no hay eventos guardados en la nube');
  } else if (!res.ok) {
    // Si falla la lectura, no tocar el archivo: mejor un calendario algo viejo que uno vacío
    console.error('Error leyendo Firebase:', res.status, await res.text());
    process.exit(1);
  } else {
    const doc = await res.json();
    events = JSON.parse(doc.fields?.events?.stringValue || '[]');
  }
  // DTSTAMP fijo por semana (lunes): el archivo solo cambia cuando cambian los eventos,
  // y al menos una vez por semana para que GitHub no desactive el robot por inactividad
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const stamp = d.toISOString().slice(0, 10).replace(/-/g, '') + 'T000000Z';
  fs.writeFileSync(path.join(__dirname, '..', 'familia.ics'), buildICS(events, { stamp }));
  console.log('familia.ics generado con', events.length, 'eventos');
})();
