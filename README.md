# 📅 Calendario Familia Díaz González

Calendario familiar de cumpleaños, aniversarios, celebraciones y recordatorios.

- **App:** https://elguaro433.github.io/calendario-familia/
- **Suscripción de Google Calendar:** https://elguaro433.github.io/calendario-familia/familia.ics
- **Propietario:** Emmanuel Díaz (`emmanuel050216@gmail.com`)

## Cómo funciona

```
 Teléfonos (app)  ──escriben──▶  Firebase Firestore  ◀──lee cada hora──  Robot de GitHub
   │  (solo la familia,           colección                                 │
   │   con sesión de Google)      calendario_eventos                        ├─▶ familia.ics        → Google Calendar
   └──────────── ven en tiempo real ◀──┘                                    └─▶ backup/eventos.json → copia de seguridad
```

| Pieza | Dónde | Para qué |
|---|---|---|
| `index.html` | GitHub Pages | La app completa (pantallas, formularios, sincronización) |
| `compartido.js` | GitHub Pages | Tipos de evento y generador `.ics`; lo usan la app **y** el robot |
| `sw.js` | GitHub Pages | Permite abrir la app sin internet; con internet siempre carga la versión nueva |
| `firestore.rules` | Consola de Firebase | Copia de las reglas de seguridad publicadas (ver abajo) |
| `scripts/generar-ics.js` + `.github/workflows/google-calendar.yml` | GitHub Actions | Robot: cada hora genera `familia.ics` y `backup/eventos.json` |

### Datos en Firebase (proyecto `familia-diaz-gonzalez`)

- `calendario_eventos/{id}` → un documento por evento. Campos: `id, tipo, titulo, fecha (AAAA-MM-DD), hora, repite (no|anual|mensual|semanal), aviso (días), anioConocido, persona, notas, updatedAt, updatedBy`.
- `calendario_familia/miembros` → `{ emails: [...] }` familiares que pueden editar. Se gestiona desde la app: **Ajustes → Quién puede editar** (solo lo ve el propietario).
- `appdata/...` → **app de finanzas**, no la toca el calendario.

### Seguridad

- **Ver** el calendario: cualquiera con el enlace (igual que la suscripción `.ics`, que es pública).
- **Crear / cambiar / borrar**: solo el propietario y los correos de `calendario_familia/miembros`, con sesión de Google. Lo imponen las reglas de Firestore, no la app.
- Las reglas también validan los datos (título obligatorio, fecha con formato correcto, tamaños máximos).

## Tareas habituales

**Añadir a un familiar para que pueda editar:** el propietario entra en la app → ⚙️ Ajustes → «Quién puede editar» → escribe su Gmail → Añadir. Esa persona entra con esa cuenta de Google.

**Suscribirse en Google Calendar:** desde el ordenador, en la app → «📅 Google Calendar» → «Añadir a mi Google Calendar». Google refresca los calendarios suscritos cada pocas horas.

**Recuperar una copia de seguridad:**
1. En GitHub abre `backup/eventos.json` → «History» y elige el día que quieras.
2. Pulsa «Raw» y guarda el archivo (Ctrl+S).
3. En la app → ⚙️ Ajustes → «Restaurar copia de seguridad» y elige ese archivo.

**Lanzar el robot a mano:** GitHub → pestaña «Actions» → «Actualizar calendario de Google y copia» → «Run workflow».

## Cómo publicar cambios

1. Editar los archivos y **subir el número** en `const APP_VERSION = '…'` (`index.html`). Los teléfonos con la app abierta verán el aviso «Hay una versión nueva».
2. `git pull --rebase` (el robot hace commits propios) y después `git commit` + `git push`.
3. GitHub Pages publica en ~1 minuto.
4. Si cambias las reglas de seguridad: pégalas en la consola de Firebase → Firestore → Reglas → Publicar, y actualiza `firestore.rules` aquí.

## Cosas que NO hacer

- No cambiar el nombre del usuario de GitHub (`elguaro433`) ni del repositorio: dejarían de funcionar la dirección de la app y la suscripción de Google.
- No borrar la regla `appdata` de `firestore.rules`: la usa la app de finanzas.
- No ignorar los correos de GitHub que digan que el robot ha fallado.

## Mantenimiento

- El robot usa Node 24 y `actions/checkout@v5` / `actions/setup-node@v5`. Si GitHub avisa de que una versión queda obsoleta, subir esos números en `.github/workflows/google-calendar.yml`.
- El robot hace al menos un commit a la semana para que GitHub no desactive las tareas programadas por inactividad (60 días).
- Firebase SDK fijado en la versión 10.8.0 (igual que la app de finanzas).
