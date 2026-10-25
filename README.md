# 📅 Calendario Familia Díaz González

Calendario familiar de cumpleaños, aniversarios, celebraciones, recordatorios, festivos y vacaciones escolares.

- **App de Emmanuel:** https://elguaro433.github.io/calendario-familia/ (sin clave: se abre y listo)
- **App de Elibel:** https://elguaro433.github.io/calendario-familia/elibel.html
- **Propietario:** Emmanuel Díaz

## Dos calendarios, dos perfiles

Los cumpleaños y eventos son **los mismos para los dos** (un solo calendario en la nube: lo que uno añade lo ve el otro).
Lo que cambia es **de quién es la app**: cada uno instala la suya desde su enlace y queda fijada en su iPhone.

| | 📱 App de Emmanuel | 📱 App de Elibel |
|---|---|---|
| Se instala desde | `/calendario-familia/` | `/calendario-familia/elibel.html` |
| Arriba pone | Calendario Díaz González | Calendario **de Elibel** |
| Los mensajes de WhatsApp | con la voz de Emmanuel («querida suegra», «hermano»…) | con la voz de Elibel («mamá», «cuñado», «hermanita»…) |
| Felicita a su pareja | a Elibel: Amor y Amistad, Día de la Mujer, Flores Amarillas, Día de la Madre (AD y VE), Día de la Enfermera, Virgen del Carmen, aniversarios, su llegada a Andorra | a Emmanuel: Amor y Amistad, Día del Padre (AD y VE), Día del Hombre, su cumpleaños, aniversarios, su llegada a Andorra |
| Calendario del iPhone (Ajustes) | `calendario.ics` | `calendario-elibel.ics` |
| «Mensaje propio» y «Solo en mi app» | sí | no (son de Emmanuel) |
| Eventos marcados «Solo en mi app» | los ve | no le salen |

Se le manda a Elibel su enlace desde la app de Emmanuel: ⚙️ Ajustes → «💌 Enviar a Elibel su calendario».
Técnicamente: `elibel.html` guarda `calendario_yo = 'elibel'` y abre `index.html?yo=elibel` (con `manifest-elibel.json`); el código decide con `ES_ELIBEL`.

## Cómo funciona

```
 Teléfono / ordenador (app)  ──leen y escriben──▶  Firebase Firestore           ◀──lee cada día──  Robot de GitHub
                             ◀── tiempo real ────   familias/<id>/appdata/calendario-eventos                       └─▶ backup/eventos.json
```

| Pieza | Dónde | Para qué |
|---|---|---|
| `index.html` | GitHub Pages | La app completa (pantallas, formularios, sincronización) |
| `compartido.js` | GitHub Pages | Tipos de evento, festivos, celebraciones, vacaciones escolares y el `.ics` descargable |
| `sw.js` | GitHub Pages | Permite abrir la app sin internet; con internet siempre carga la versión nueva |
| `scripts/copia-seguridad.js` + `.github/workflows/copia-seguridad.yml` | GitHub Actions | Robot: cada día guarda `backup/eventos.json` (sin los números de WhatsApp: el repositorio es público) |
| `scripts/avisos.js` + `.github/workflows/avisos.yml` | GitHub Actions | Robot: cada día a las 7:03 UTC manda los avisos al móvil (Web Push) |
| `calendario.ics` | GitHub Pages | Calendario de suscripción (lo regenera el robot de copias) |
| `calendario-elibel.ics` | GitHub Pages | El de Elibel: sin los eventos «Solo en mi app» y con sus días para felicitar a Emmanuel |
| `elibel.html` + `manifest-elibel.json` | GitHub Pages | Instalación de la app de Elibel |
| `firestore.rules` | Consola de Firebase | Copia de las reglas de seguridad publicadas |

### Qué muestra el calendario

- **Eventos de la familia** (se crean y editan en la app): cumpleaños, aniversarios, celebraciones, recordatorios… Los que «se repiten cada año» salen todos los años sin límite.
- **Festivos y no laborables** (`festivos()` en `compartido.js`): nacionales de Andorra (con Carnaval) + locales de Andorra la Vella (Sant Joan 24/6, Fiesta Mayor = lunes tras el primer sábado de agosto, Santo Tomás 21/12), según la lista de días inhábiles del Consell General.
- **Celebraciones** (`celebraciones()` en `compartido.js`): Día del Amor y la Amistad (14/2), Día del Padre Andorra (19/3), Flores Amarillas (21/3 y 21/9), Día de la Madre Andorra (1er domingo de mayo) y Venezuela (2º domingo de mayo), Día del Padre Venezuela (3er domingo de junio), Día del Niño Venezuela (3er domingo de julio), Día de la Mujer (8/3), Día de la Enfermera (12/5, Venezuela y Andorra), Virgen del Carmen (16/7, santo de Elibel del Carmen).
- **Estaciones y cambio de hora** (`estaciones()` en `compartido.js`): inicio de primavera, verano, otoño e invierno con la hora exacta de Andorra (fórmulas de Meeus, se calculan solas para cualquier año) y los cambios de hora de la UE (último domingo de marzo +1 h y de octubre −1 h). El cambio de hora sale en «No te olvides» 3 días antes.
- **Vacaciones escolares** (`ESCOLAR` en `compartido.js`): curso 2026-2027 (PDF oficial del Govern d'Andorra) + verano 3/7–8/9/2027 (vuelta a clase el 9/9, a confirmar con el PDF 2027-2028).
- **Tipos de evento**: Cumpleaños, Aniversario, Celebración, Familiar, Recordatorio, Médico, Colegio, **En memoria** (🕊️ «N años de su partida» / «Cumpliría N años» si el título contiene «Cumpleaños») y Otro.
- **App de Elibel** (v1.29): `elibel.html` instala su versión (mismo calendario, mensajes con su voz y días para felicitar a Emmanuel). Desde Ajustes → «Enviar a Elibel su calendario» se le manda el enlace por WhatsApp.
- **Mensaje propio** (v1.27): campo «Mensaje para felicitar» (`mensaje`) en cumpleaños y aniversarios; si está relleno, el botón de WhatsApp envía ese en vez del automático (`mensajeFinal()`), cambiando `{nombre}` y `{edad}`. «Partir del automático» copia el automático al campo para retocarlo. No va en la copia pública.
- **Días de Elibel** (v1.26): en las celebraciones que unen a Emmanuel con su esposa (Amor y Amistad, Día de la Mujer, Flores Amarillas, Día de la Madre AD y VE, Día de la Enfermera, Virgen del Carmen) sale un botón verde con un mensaje solo para ella (`MENSAJES_ELIBEL` en `index.html`, clave `elibel` en `celebraciones()`). Su número sale del cumpleaños con «¿De quién?» = Esposa; los aniversarios de boda y la llegada de Elibel a Andorra también lo usan. Salen en «No te olvides» desde 3 días antes y en el calendario suscrito con alarma a las 9:00.
- **Felicitar por WhatsApp**: botón verde en cumpleaños y en el aniversario de boda. Abre `wa.me` con un mensaje cariñoso según el parentesco (campo «¿De quién?»: Hijo, Esposa, Padre de Emmanuel, Suegra, Hermana/o, Sobrino/a, Prima/o, Tía, Cuñada… o genérico). Se edita en `mensajeWA()` de `index.html`.

### Colores
Cumpleaños `#d9528b` · Aniversario `#7c5cc4` · Celebraciones `#e27a45` · Vacaciones escolares `#3fa7d6` · Día festivo `#9b2226` (granate, distinto del rosa de los cumpleaños) · Estaciones `#7a9a45` · En memoria `#9c8fb8`. Tema claro lavanda por defecto; oscuro suave con 🌙.

En ⚙️ Ajustes → «Estilo de la app» cada dispositivo elige un estilo (Lavanda, Rosa, Vino, Durazno, Menta, Océano, Grafito o «Tu color») y puede cambiar el color de cada tipo de evento. Se guarda en ese teléfono u ordenador (`TEMAS`, `applyEstilo()` y `applyColores()` en `index.html`); todos los colores de la app salen de las variables `--tint`, `--hdr1`, `--hdr2`, `--pink` y `--pink2`.

Las capas de festivos, celebraciones y vacaciones se pueden ocultar en ⚙️ Ajustes → «Qué mostrar».

### Datos en Firebase (proyecto `familia-diaz-gonzalez`)

- `familias/<id>/appdata/calendario-eventos` → campo `eventos`: mapa `id → evento`. Campos del evento: `id, tipo, titulo, fecha (AAAA-MM-DD), hora, repite (no|anual|mensual|semanal), aviso (días), anioConocido, persona, notas, telefono`. `telefono` (opcional, cumpleaños y aniversarios) hace que el botón de WhatsApp abra el chat de esa persona; sin prefijo se adivina el país en `waNumero()` (04xx → +58, 6 cifras → +376, 6xx/7xx de 9 cifras → +34).
- Cada cambio actualiza solo su evento (`eventos.<id>`), así que dos personas pueden guardar a la vez sin pisarse.
- El resto de `familias/<id>/appdata/...` es de la **app de finanzas**; el calendario no lo toca.
- Sin inicio de sesión con Google: desde el 25/10/2026 (v1.37) los datos están en `familias/<id>/appdata`, y `<id>` sale de la **clave familiar** que cada móvil pide una vez (la misma que en la app de finanzas). Sin la clave no se lee ni se escribe nada. Los robots usan el secreto de GitHub `FAM_ID`.
- Las colecciones `calendario_eventos` y `calendario_familia` de `firestore.rules` son de una versión anterior (con Google) y ya no se usan.

### Avisos al móvil y Calendario del iPhone

- **Avisos (Web Push):** en ⚙️ Ajustes → «Activar avisos» (en iPhone, con la app abierta desde el icono). El móvil se apunta en `appdata/calendario-avisos` (campo `subs`). El robot `avisos.js` manda cada mañana lo que toca: el mismo día, el día antes y los días de «Avisarme». Al tocar el aviso se abre la app con `?evento=<id>` (se abre ese evento, con el botón de felicitar). Los móviles que ya no aceptan avisos se borran solos.
- Clave pública VAPID en `index.html` y `scripts/avisos.js`; la privada es el secreto **`VAPID_PRIVATE`** de GitHub (Settings → Secrets and variables → Actions). Sin él, el robot solo lista lo que mandaría.
- **Calendario suscrito:** Ajustes → «Ver los eventos en el Calendario del iPhone» abre `webcal://…/calendario.ics`. Sin teléfonos. Es público como `backup/eventos.json`.

## Tareas habituales

**Recuperar una copia de seguridad:**
1. En GitHub abre `backup/eventos.json` → «History» y elige el día que quieras.
2. Pulsa «Raw» y guarda el archivo (Ctrl+S).
3. En la app → ⚙️ Ajustes → «Restaurar copia de seguridad» y elige ese archivo.

**Curso escolar nuevo:** añadir sus periodos a la lista `ESCOLAR` de `compartido.js` (id, desde, hasta, icono, título).

**Nueva celebración fija:** añadirla en `celebraciones()` de `compartido.js`.

**Lanzar el robot a mano:** GitHub → pestaña «Actions» → «Copia de seguridad del calendario» → «Run workflow».

## Añadir o cambiar eventos sin la app (desde un script)

El documento `familias/<id>/appdata/calendario-eventos` se puede escribir por la API REST de Firestore. **Siempre** con `` updateMask.fieldPaths=eventos.`<id>` `` por cada evento que se toca: **un PATCH sin máscara reemplaza el documento entero y borra todo** (pasó una vez; se restauró desde la copia). Antes de enviar, comprobar que la lista de cambios no está vacía, y después volver a leer el total.

## Cómo publicar cambios

1. Editar los archivos y **subir el número** en `const APP_VERSION = '…'` **y** en `compartido.js?v=…` (ambos en `index.html`), para que los teléfonos no mezclen archivos viejos y nuevos. Los teléfonos con la app abierta verán el aviso «Hay una versión nueva».
2. `git pull --rebase` (el robot hace commits propios) y después `git commit` + `git push`.
3. GitHub Pages publica en ~1 minuto.

## Cosas que NO hacer

- No cambiar el nombre del usuario de GitHub (`elguaro433`) ni del repositorio: dejaría de funcionar la dirección de la app.
- No borrar la regla `familias/{fam}/appdata` de las reglas de Firestore: la usan esta app y la de finanzas.
- No ignorar los correos de GitHub que digan que el robot ha fallado.

## Mantenimiento

- El robot usa Node 24 y `actions/checkout@v5` / `actions/setup-node@v5`. Si GitHub avisa de que una versión queda obsoleta, subir esos números en `.github/workflows/copia-seguridad.yml`.
- El robot hace al menos un commit a la semana para que GitHub no desactive las tareas programadas por inactividad (60 días).
- Firebase SDK fijado en la versión 10.8.0 (igual que la app de finanzas).
