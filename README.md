# Familia Alrededor del Mundo

App para compartir en familia qué hora es y qué está haciendo cada uno: un
mapa mundial con la ubicación de cada persona, relojes en vivo por zona
horaria, y un muro familiar donde cualquiera puede contar dónde está y
subir fotos o videos.

## Cómo funciona (para entender el código)

No hay servidor propio ni base de datos tradicional. Todo corre en dos
lugares gratuitos:

| Parte | Dónde vive | Qué hace |
|---|---|---|
| Sitio (HTML/CSS/JS) | GitHub Pages | Muestra el mapa, los relojes, el muro y los perfiles. Es 100% estático: no hay build, no hay backend propio. |
| Lista de familiares | `data/familiares.json` en este repo | Quiénes son: nombre, avatar, bio, y una ubicación/zona horaria *inicial*. Se edita a mano y se sube con `git push`. |
| Ubicación actual + muro (fotos/videos) | Google Drive + Google Sheets, vía un script de Google Apps Script | Cuando alguien hace "check-in" desde la home (dónde está + qué está haciendo + foto opcional), el script guarda el archivo en Drive, actualiza su ubicación en la hoja "Ubicaciones" y agrega la publicación a la hoja "Publicaciones". El sitio lee ambas para armar el mapa y el muro. |

### Piezas clave del código

- `assets/js/reloj.js`: usa [Luxon](https://moment.github.io/luxon/) para
  calcular la hora actual en cualquier zona horaria IANA (ej.
  `Europe/Paris`, `Australia/Sydney`), manejando correctamente los cambios
  de horario de verano.
- `assets/js/api.js`: todo lo que habla con el backend de Google — pedir
  datos, publicar, convertir un archivo a base64, pedir la ubicación del
  navegador y (best-effort) convertir lat/lon en ciudad/país.
- `assets/js/main.js`: dibuja el mapa con [Leaflet](https://leafletjs.com/),
  las tarjetas de la home con la hora de cada uno, el formulario de
  check-in, y el muro familiar (todas las publicaciones, de todos,
  ordenadas por fecha).
- `assets/js/perfil.js`: la vista de una sola persona — su hora, su
  ubicación actual, y solo sus publicaciones.
- `google-apps-script/Code.gs`: el "backend". `doGet` devuelve las
  publicaciones y las ubicaciones guardadas; `doPost` recibe un check-in
  (actualiza la ubicación de esa persona) y, si viene con texto o archivo,
  también crea una publicación nueva en el muro.

### El formulario de "check-in"

Cuando alguien completa dónde está en la home:

1. Puede tocar "Usar mi ubicación actual" — el navegador pide permiso de
   geolocalización, y la app intenta convertir esas coordenadas en
   ciudad/país automáticamente (usando el servicio gratuito
   [Nominatim](https://nominatim.org/) de OpenStreetMap). Si falla, se
   completa a mano.
2. La zona horaria se detecta sola con `Intl.DateTimeFormat().resolvedOptions().timeZone`
   — es la zona horaria configurada en su propio dispositivo, así que no
   hace falta ningún servicio externo para eso.
3. Al publicar, esa ubicación queda guardada como "la última conocida" de
   esa persona (mueve su marcador en el mapa) y, si escribió algo o subió
   una foto, también aparece como una publicación nueva en el muro.

## Puesta en marcha

1. Editá `data/familiares.json` con los datos reales de tu familia (nombre,
   avatar, bio, y una ubicación inicial — se va a ir actualizando sola
   cuando cada uno haga su primer check-in).
2. Seguí [`SETUP.md`](SETUP.md) para activar el muro familiar (Google
   Sheet + Apps Script + Drive) — 10-15 minutos, sin necesidad de Google
   Cloud Console.
3. Activá GitHub Pages (también en `SETUP.md`, Paso 5).

## Ideas para seguir aprendiendo / mejorar

- Agregar autenticación real (Google Sign-In) para que solo la familia
  pueda publicar.
- Notificaciones (ej. por email) cuando alguien sube algo nuevo.
- Mostrar el clima actual de cada ciudad además de la hora.
- Mover la lista de familiares también a la Sheet, para poder agregar
  gente sin tocar código.
