# Calendario Familia Díaz González — notas para seguir trabajando

Lee primero `README.md` (arquitectura, datos, colores, tareas habituales).

- App estática en GitHub Pages (`elguaro433/calendario-familia`, rama `main`). Sin build: editar `index.html` / `compartido.js` y hacer push.
- En cada versión, subir **a la vez** `APP_VERSION` y `compartido.js?v=…` en `index.html`.
- El robot de copias hace commits propios: `git pull --rebase` antes de `git push`.
- Datos: Firestore `appdata/calendario-eventos`, campo `eventos` (mapa id → evento). El propietario no quiere inicio de sesión ni Google: no reintroducirlos.
- Escribir en la nube solo con PATCH + `updateMask` por evento, desde un archivo `.py` ejecutado con `PYTHONIOENCODING=utf-8` (las tildes en heredocs de bash fallan). Nunca enviar una máscara vacía.
- Probar en local con el servidor de `.claude/launch.json` (`python -m http.server 8765`) y verificar la versión publicada tras cada push.
- El usuario escribe por voz: confirmar nombres dudosos. Respuestas cortas y en español.
