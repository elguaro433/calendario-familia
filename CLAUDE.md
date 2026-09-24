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

## Pendiente (al cerrar el 24/09/2026, v1.22, 42 fechas)
- Parentesco de **Aida, Maita y Victor Aponte** (`persona` vacío → mensaje de WhatsApp genérico).
- Año de nacimiento de Samuel, Magdaliyi, Elida, Thiago, Sofía, Antonella, Eliette y Rusbeilyn. El usuario los pasa en fotos de documentos: usar solo la fecha de nacimiento.
- Ideas ya propuestas y sin hacer: campo «Teléfono» para abrir el chat de WhatsApp directo; correo diario con los avisos desde el robot (el usuario tendría que poner la clave de correo él mismo).
