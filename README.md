# 📅 Calendario Familia Díaz González

Calendario familiar de cumpleaños, aniversarios, celebraciones, recordatorios, festivos y vacaciones escolares.

- **App:** https://elguaro433.github.io/calendario-familia/ (sin clave: se abre y listo)
- **Propietario:** Emmanuel Díaz (`emmanuel050216@gmail.com`)

## Cómo funciona

```
 Teléfono / ordenador (app)  ──leen y escriben──▶  Firebase Firestore           ◀──lee cada día──  Robot de GitHub
                             ◀── tiempo real ────   appdata/calendario-eventos                       └─▶ backup/eventos.json
```

| Pieza | Dónde | Para qué |
|---|---|---|
| `index.html` | GitHub Pages | La app completa (pantallas, formularios, sincronización) |
| `compartido.js` | GitHub Pages | Tipos de evento, festivos, celebraciones, vacaciones escolares y el `.ics` descargable |
| `sw.js` | GitHub Pages | Permite abrir la app sin internet; con internet siempre carga la versión nueva |
| `scripts/copia-seguridad.js` + `.github/workflows/copia-seguridad.yml` | GitHub Actions | Robot: cada día guarda `backup/eventos.json` |
| `firestore.rules` | Consola de Firebase | Copia de las reglas de seguridad publicadas |

### Qué muestra el calendario

- **Eventos de la familia** (se crean y editan en la app): cumpleaños, aniversarios, celebraciones, recordatorios… Los que «se repiten cada año» salen todos los años sin límite.
- **Festivos y no laborables** (`festivos()` en `compartido.js`): nacionales de Andorra (con Carnaval) + locales de Andorra la Vella (Sant Joan 24/6, Fiesta Mayor = lunes tras el primer sábado de agosto, Santo Tomás 21/12), según la lista de días inhábiles del Consell General.
- **Celebraciones** (`celebraciones()` en `compartido.js`): Día del Amor y la Amistad (14/2), Día del Padre Andorra (19/3), Flores Amarillas (21/3 y 21/9), Día de la Madre Andorra (1er domingo de mayo) y Venezuela (2º domingo de mayo), Día del Padre Venezuela (3er domingo de junio), Día del Niño Venezuela (3er domingo de julio), Día de la Mujer (8/3), Día de la Enfermera (12/5, Venezuela y Andorra), Virgen del Carmen (16/7, santo de Elibel del Carmen).
- **Estaciones y cambio de hora** (`estaciones()` en `compartido.js`): inicio de primavera, verano, otoño e invierno con la hora exacta de Andorra (fórmulas de Meeus, se calculan solas para cualquier año) y los cambios de hora de la UE (último domingo de marzo +1 h y de octubre −1 h). El cambio de hora sale en «No te olvides» 3 días antes.
- **Vacaciones escolares** (`ESCOLAR` en `compartido.js`): curso 2026-2027 (PDF oficial del Govern d'Andorra) + verano 3/7–8/9/2027 (vuelta a clase el 9/9, a confirmar con el PDF 2027-2028).
- **Tipos de evento**: Cumpleaños, Aniversario, Celebración, Familiar, Recordatorio, Médico, Colegio, **En memoria** (🕊️ «N años de su partida» / «Cumpliría N años» si el título contiene «Cumpleaños») y Otro.
- **Felicitar por WhatsApp**: botón verde en cumpleaños y en el aniversario de boda. Abre `wa.me` con un mensaje cariñoso según el parentesco (campo «¿De quién?»: Hijo, Esposa, Padre de Emmanuel, Suegra, Hermana/o, Sobrino/a, Prima/o, Tía, Cuñada… o genérico). Se edita en `mensajeWA()` de `index.html`.

### Colores
Cumpleaños `#d9528b` · Aniversario `#7c5cc4` · Celebraciones `#e27a45` · Vacaciones escolares `#3fa7d6` · Día festivo `#9b2226` (granate, distinto del rosa de los cumpleaños) · Estaciones `#7a9a45` · En memoria `#9c8fb8`. Tema claro lavanda por defecto; oscuro suave con 🌙.

En ⚙️ Ajustes → «Estilo de la app» cada dispositivo elige un estilo (Lavanda, Rosa, Vino, Durazno, Menta, Océano, Grafito o «Tu color») y puede cambiar el color de cada tipo de evento. Se guarda en ese teléfono u ordenador (`TEMAS`, `applyEstilo()` y `applyColores()` en `index.html`); todos los colores de la app salen de las variables `--tint`, `--hdr1`, `--hdr2`, `--pink` y `--pink2`.

Las capas de festivos, celebraciones y vacaciones se pueden ocultar en ⚙️ Ajustes → «Qué mostrar».

### Datos en Firebase (proyecto `familia-diaz-gonzalez`)

- `appdata/calendario-eventos` → campo `eventos`: mapa `id → evento`. Campos del evento: `id, tipo, titulo, fecha (AAAA-MM-DD), hora, repite (no|anual|mensual|semanal), aviso (días), anioConocido, persona, notas`.
- Cada cambio actualiza solo su evento (`eventos.<id>`), así que dos personas pueden guardar a la vez sin pisarse.
- El resto de `appdata/...` es de la **app de finanzas**; el calendario no lo toca.
- Sin inicio de sesión: la colección `appdata` es de acceso libre (igual que la app de finanzas). Quien tenga el enlace puede ver y cambiar el calendario.
- Las colecciones `calendario_eventos` y `calendario_familia` de `firestore.rules` son de una versión anterior (con Google) y ya no se usan.

## Tareas habituales

**Recuperar una copia de seguridad:**
1. En GitHub abre `backup/eventos.json` → «History» y elige el día que quieras.
2. Pulsa «Raw» y guarda el archivo (Ctrl+S).
3. En la app → ⚙️ Ajustes → «Restaurar copia de seguridad» y elige ese archivo.

**Curso escolar nuevo:** añadir sus periodos a la lista `ESCOLAR` de `compartido.js` (id, desde, hasta, icono, título).

**Nueva celebración fija:** añadirla en `celebraciones()` de `compartido.js`.

**Lanzar el robot a mano:** GitHub → pestaña «Actions» → «Copia de seguridad del calendario» → «Run workflow».

## Añadir o cambiar eventos sin la app (desde un script)

El documento `appdata/calendario-eventos` se puede escribir por la API REST de Firestore. **Siempre** con `` updateMask.fieldPaths=eventos.`<id>` `` por cada evento que se toca: **un PATCH sin máscara reemplaza el documento entero y borra todo** (pasó una vez; se restauró desde la copia). Antes de enviar, comprobar que la lista de cambios no está vacía, y después volver a leer el total.

## Cómo publicar cambios

1. Editar los archivos y **subir el número** en `const APP_VERSION = '…'` **y** en `compartido.js?v=…` (ambos en `index.html`), para que los teléfonos no mezclen archivos viejos y nuevos. Los teléfonos con la app abierta verán el aviso «Hay una versión nueva».
2. `git pull --rebase` (el robot hace commits propios) y después `git commit` + `git push`.
3. GitHub Pages publica en ~1 minuto.

## Cosas que NO hacer

- No cambiar el nombre del usuario de GitHub (`elguaro433`) ni del repositorio: dejaría de funcionar la dirección de la app.
- No borrar la regla `appdata` de las reglas de Firestore: la usan esta app y la de finanzas.
- No ignorar los correos de GitHub que digan que el robot ha fallado.

## Mantenimiento

- El robot usa Node 24 y `actions/checkout@v5` / `actions/setup-node@v5`. Si GitHub avisa de que una versión queda obsoleta, subir esos números en `.github/workflows/copia-seguridad.yml`.
- El robot hace al menos un commit a la semana para que GitHub no desactive las tareas programadas por inactividad (60 días).
- Firebase SDK fijado en la versión 10.8.0 (igual que la app de finanzas).
