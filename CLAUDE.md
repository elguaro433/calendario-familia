# Calendario Familia Díaz González — notas para seguir trabajando

Lee primero `README.md` (arquitectura, datos, colores, tareas habituales).

- App estática en GitHub Pages (`elguaro433/calendario-familia`, rama `main`). Sin build: editar `index.html` / `compartido.js` y hacer push.
- En cada versión, subir **a la vez** `APP_VERSION` y `compartido.js?v=…` en `index.html`.
- El robot de copias hace commits propios: `git pull --rebase` antes de `git push`.
- Datos: Firestore `appdata/calendario-eventos`, campo `eventos` (mapa id → evento). El propietario no quiere inicio de sesión ni Google: no reintroducirlos.
- Escribir en la nube solo con PATCH + `updateMask` por evento, desde un archivo `.py` ejecutado con `PYTHONIOENCODING=utf-8` (las tildes en heredocs de bash fallan). Nunca enviar una máscara vacía.
- Probar en local con el servidor de `.claude/launch.json` (`python -m http.server 8765`) y verificar la versión publicada tras cada push.
- El usuario escribe por voz: confirmar nombres dudosos. Respuestas cortas y en español.
- En este PC no hay `node` ni `gh`: los scripts se hacen en Python. En los eventos, `aviso` va como número (`integerValue`).
- Firestore REST devuelve los campos en orden aleatorio: el diff de `backup/eventos.json` sale grande aunque apenas cambie nada.
- Colores: todo sale de `--tint`, `--hdr1`, `--hdr2`, `--pink`, `--pink2` (estilo) y `COL_BASE` (tipos); el usuario los elige en Ajustes y se guardan por dispositivo.

- v1.25 (11/10/2026): avisos al móvil (Web Push, robot `avisos.js`, secreto `VAPID_PRIVATE`) y calendario suscrito (`calendario.ics`). Ver README. Sin probar aún en iPhone real.

- v1.29: **app de Elibel**. Enlace `elibel.html` (+ `manifest-elibel.json`, start `index.html?yo=elibel`) → `localStorage.calendario_yo = 'elibel'` fijo en su móvil. Mismo calendario; cambia: mensajes con su voz (`mensajeWAElibel`: Elida = mamá, Samuel padre = suegro, hermanos de Emmanuel = cuñados, Emmanuel = esposo), sin botón en su propio cumpleaños, aniversarios y «días de pareja» van a Emmanuel (número en su cumpleaños `imp-cumple-papa`), días de Emmanuel = clave `emmanuel` en `celebraciones()` (Amor y Amistad, Día del Padre AD/VE; `MENSAJES_EMMANUEL`). En su app no se edita el «mensaje propio» (es de Emmanuel) ni sale el calendario suscrito. Cabecera «Calendario de Elibel». Ella aún no la usa (11/10).
- v1.31: Ecleidis = «Cuñada (hermana de Elibel)» → en la app de Elibel, «hermanita» (regla `herman[ao] de elibel`). Ana Salas = «Cuñada (esposa de Shamir)» → «cuñada» en las dos apps (v1.32). Tía Bety: tía de Emmanuel, Elibel también le dice tía (regla `t[ií][ao]` en su app).
- v1.30: Ajustes reordenado: resumen (de quién es la app, nº de fechas y con WhatsApp), Apariencia Claro/Oscuro/Automático (`setApariencia`; ojo, `setTema` es el de los estilos de color), colores por tipo plegados, «En el iPhone» (calendario suscrito + «Enviar a Elibel su calendario» por WhatsApp), copias al final.
- v1.28: icono nuevo (imagen de Emmanuel «Familia 2004»; esquinas blancas rellenadas para que no salga doble marco). `icon-1024.png` queda para la App Store. iOS/Windows solo cogen el icono nuevo al volver a añadir el acceso.
- v1.27 (11/10/2026): mensaje propio por persona (`mensaje`, no va en la copia pública) y lavado de cara: sin pestaña «Año» (3 pestañas), iconos SVG en cabecera/barra/Ajustes (sin emojis «July 17»), «en N días» en la 2.ª línea (nombres enteros), botón de WhatsApp verde lleno solo si es en ≤7 días (si no, `.wa.discreto`), franja «Hoy/Próximo» solo si no hay nada en «No te olvides», mini iconos en el mes y vacaciones como franja (`.cell.esc`), punto de sincronización solo si hay problema, festivos legibles en oscuro, crédito una sola vez.
- v1.26: días de Elibel (ver README). El bloque «Avisos en este móvil» (Web Push) está oculto con `hidden`: el usuario no quiere poner el secreto `VAPID_PRIVATE`; los avisos le llegan por el calendario suscrito.

- v1.34: Día del Hombre (19/11, clave `emmanuel: hombre`). Calendario suscrito de Elibel `calendario-elibel.ics` (robot de copias; sin eventos `privado`; sus días para felicitar a Emmanuel con alarma 3 días antes y el mismo día a las 9:00). En su app, Ajustes → «En el iPhone» abre el suyo.
- v1.33: casilla «Solo en mi app» (`privado`) en cada evento: no sale en la app de Elibel (filtro en `occurrences`). Marcados: Ricardo Paez, Jorge Tigua.

## Pendiente (11/10/2026, v1.25, 44 fechas)
- Secreto `VAPID_PRIVATE`: el usuario decidió no ponerlo (11/10). El robot de avisos solo lista; el bloque de Ajustes está oculto.
- Avisos y calendario suscrito sin probar en iPhone real. El robot de avisos funciona (ejecución manual del 11/10: «0 avisos para 0 móviles»).
- WhatsApp: 27 de 38 cumpleaños con número (más los 2 aniversarios de boda con el de Elibel). Sin número: Samuel (hermano), Eilin, Elida, Maita, Ecleidis, Antonella, Eliette, Sofía, Mathias, Joaquín (y Emmanuel Diaz, que es él). Los niños sin WhatsApp llevan el de su padre o madre (Pol → Jhon, Joan y Nuria → Xavier, Thiago → Magdaliyi).
- Año de nacimiento: falta en 23 cumpleaños. El usuario los pasa en fotos de documentos: usar solo la fecha de nacimiento.
- Ideas: proteger la escritura en Firestore (hoy cualquiera con el enlace puede cambiar); preparar la versión para la App Store como en Mi Música (separar lo personal, festivos por país, inglés, avisos y Contactos nativos).
