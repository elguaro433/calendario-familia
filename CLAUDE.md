# Calendario Familia Díaz González — notas para seguir trabajando

Lee primero `README.md` (arquitectura, datos, colores, tareas habituales).
Estado al 11/10/2026: **v1.35**, 44 fechas (38 cumpleaños, 35 con WhatsApp).

## ⚠️ Lo primero: hay DOS calendarios con DOS perfiles

Un solo calendario de datos (los mismos cumpleaños para los dos) y **dos apps**, una por persona.
Cada una habla con la voz de su dueño y felicita a su pareja en sus días.

| | App de **Emmanuel** | App de **Elibel** |
|---|---|---|
| Enlace | `…/calendario-familia/` | `…/calendario-familia/elibel.html` |
| Perfil | `calendario_yo` vacío o `'emmanuel'` | `localStorage.calendario_yo = 'elibel'` (fijo en su móvil) |
| Manifiesto | `manifest.json` | `manifest-elibel.json` (start `index.html?yo=elibel`) |
| Cabecera | «Calendario Díaz González» | «Calendario de Elibel» |
| Mensajes | `mensajeWA()` (voz de Emmanuel) | `mensajeWAElibel()` (voz de Elibel) |
| Días de pareja | clave `elibel` de `celebraciones()` → `MENSAJES_ELIBEL` (Amor, Mujer, Flores, Madre AD/VE, Enfermera, Virgen del Carmen) | clave `emmanuel` → `MENSAJES_EMMANUEL` (Amor, Día del Padre AD/VE, Día del Hombre) |
| Aniversarios y su llegada a Andorra | a Elibel | a Emmanuel |
| Su propio cumpleaños | sin botón (`imp-cumple-papa`) | sin botón («¿De quién?» = Esposa) |
| Calendario del iPhone | `calendario.ics` | `calendario-elibel.ics` |
| «Mensaje propio» y «Solo en mi app» | los edita | no se ven (son de Emmanuel) |
| Eventos «Solo en mi app» (`privado`) | se ven | ocultos (Ricardo Paez, Jorge Tigua) |

En el código: `YO`, `ES_ELIBEL`, `PAREJA`, `esElibel(ev)`, `esEmmanuel(ev)`, `telPareja()`, `claveDe(f)`, `MENSAJES_PAREJA`.
El número de cada uno sale de su cumpleaños (Elibel: +376 644 526; Emmanuel: +376 644 516).
**Elibel aún no la usa** (11/10): se le manda desde Ajustes → «💌 Enviar a Elibel su calendario».

### Parentescos, mirados desde cada lado
«¿De quién?» está escrito desde el lado de Emmanuel. En la app de Elibel se traduce:
Elida («Suegra (madre de Elibel)») → **mamá** · Abuelo Samuel («Padre de Emmanuel») → **suegro** ·
Shamir, Magdaliyi, Samuel («Hermano/a») → **cuñado/a** · Ecleidis («Cuñada (hermana de Elibel)») → **hermanita** ·
Ana Salas («Cuñada (esposa de Shamir)») → **cuñada** · Tía Bety → **tía** (ella también le dice tía) ·
hijos, sobrinos y niños → el mismo mensaje en las dos apps. El resto: abrazo «de parte de Emmanuel, los niños y mío».
Samuel (hermano) es un niño (nació 5/8/2023): mensaje de «hermanito».
Familia: Eliette y Mathias = hijos de Shamir y Ana; Thiago = hijo de Magdaliyi; Sofía = hija de Ecleidis;
Antonella, Anabella, Nelliana = hijas de la prima Rosana; Pol = hijo de Jhon; Joan y Nuria = hijos de Xavier.
Los niños sin WhatsApp llevan el de su padre o madre (Pol → Jhon, Joan/Nuria → Xavier, Thiago → Magdaliyi,
Eliette/Mathias → Shamir, Antonella → Rosana, Joaquín → su mamá Marí Carmen).

## Cómo se trabaja aquí

- App estática en GitHub Pages (`elguaro433/calendario-familia`, rama `main`). Sin build: editar `index.html` / `compartido.js`.
- En cada versión, subir **a la vez** `APP_VERSION` y `compartido.js?v=…` en `index.html`.
- El robot de copias hace commits propios: traer `main` antes de subir.
- Datos: Firestore `appdata/calendario-eventos`, campo `eventos` (mapa id → evento). El propietario no quiere inicio de sesión ni Google: no reintroducirlos.
- Escribir en la nube solo con PATCH + `updateMask` por evento, desde un `.py` con `PYTHONIOENCODING=utf-8`. Nunca una máscara vacía; volver a leer el total después.
- Campos del evento: `id, tipo, titulo, fecha, hora, repite, aviso (número), anioConocido, persona, notas, telefono, mensaje, privado`.
- La copia pública (`backup/eventos.json`, repo público) va **sin** `telefono` ni `mensaje`.
- Probar en local con `python -m http.server 8765` (Chrome a 393 px) y probar **las dos apps** (`?yo=elibel`).
- El usuario escribe por voz: confirmar nombres dudosos. Respuestas cortas y en español.
- Colores: todo sale de `--tint`, `--hdr1`, `--hdr2`, `--pink`, `--pink2` y `COL_BASE`; se guardan por dispositivo.
- Ojo: `setTema()` es el de los estilos de color; la apariencia claro/oscuro/automático es `setApariencia()`.

## Historial reciente (11/10/2026)

- v1.23–1.24: campo «WhatsApp» (`telefono`) → el botón verde abre el chat de esa persona; botón «📋 Pegar» (o «👤 Contactos» si el navegador tiene Contact Picker).
- v1.25: calendario suscrito (`calendario.ics`) y avisos Web Push (robot `avisos.js`). El usuario **no quiere** poner el secreto `VAPID_PRIVATE`: el bloque de avisos está oculto con `hidden` y los avisos llegan por el calendario del iPhone.
- v1.26: días de Elibel con mensaje propio para ella.
- v1.27: «Mensaje para felicitar» por persona (`mensaje`, `{nombre}` y `{edad}`) y lavado de cara (3 pestañas sin «Año», iconos SVG, nombres enteros, botón de WhatsApp grande solo si es en ≤ 7 días, mes con mini iconos).
- v1.28: icono nuevo «Familia 2004» (imagen del usuario, esquinas rellenadas). `icon-1024.png` para la App Store.
- v1.29: app de Elibel. v1.30: Ajustes reordenado (resumen, Claro/Oscuro/Automático, colores plegados, «En el iPhone», copias).
- v1.31–1.32: Ecleidis, Ana Salas y tía Bety desde el lado de Elibel. v1.33: «Solo en mi app» (`privado`).
- v1.34: Día del Hombre (19/11) y `calendario-elibel.ics` (alarma 3 días antes y el mismo día a las 9:00).
- v1.35: Samuel, hermano pequeño, con mensaje de niño.

## Pendiente

- WhatsApp sin número: Sofía (hija de Ecleidis, no está en los contactos de ninguno), Maita, Samuel (hermano; se puede poner el del papá si él dice).
- Año de nacimiento: falta en 22 cumpleaños. El usuario los pasa en fotos de documentos: usar solo la fecha de nacimiento.
- Sin probar en iPhone real: los dos calendarios suscritos y la instalación de la app de Elibel.
- Ideas: proteger la escritura en Firestore (hoy cualquiera con el enlace puede cambiar, y ya hay teléfonos); preparar la versión para la App Store como en Mi Música (separar lo personal, festivos por país, inglés, avisos y Contactos nativos).
