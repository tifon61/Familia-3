# Familia Alrededor del Mundo

App para compartir en familia qué hora es y qué está haciendo cada uno, con
un mapa mundial, relojes en vivo por zona horaria, y un perfil por persona
con un histórico de fotos y videos.

## Cómo funciona (para entender el código)

No hay servidor propio ni base de datos tradicional. Todo corre en dos
lugares gratuitos:

| Parte | Dónde vive | Qué hace |
|---|---|---|
| Sitio (HTML/CSS/JS) | GitHub Pages | Muestra el mapa, los relojes y los perfiles. Es 100% estático: no hay build, no hay backend propio. |
| Lista de familiares | `data/familiares.json` en este repo | Nombre, ciudad, coordenadas y zona horaria de cada persona. Se edita a mano y se sube con `git push`. |
| Fotos/videos + histórico | Google Drive + Google Sheets, vía un script de Google Apps Script | Cuando alguien sube contenido desde su perfil, el script lo guarda en una carpeta de Drive y anota los datos (quién, cuándo, título) en una fila de una Sheet. El sitio lee esa Sheet para mostrar el histórico. |

### Piezas clave del código

- `assets/js/reloj.js`: usa [Luxon](https://moment.github.io/luxon/) para
  calcular la hora actual en cualquier zona horaria IANA (ej.
  `Europe/Paris`, `Australia/Sydney`), manejando correctamente los cambios
  de horario de verano.
- `assets/js/main.js`: dibuja el mapa con [Leaflet](https://leafletjs.com/)
  y las tarjetas de la home, actualizando el reloj de cada persona cada
  segundo.
- `assets/js/perfil.js`: arma la página de perfil, envía el formulario de
  "subir" al script de Google (convirtiendo el archivo a base64 en el
  navegador) y pinta el histórico devuelto.
- `google-apps-script/Code.gs`: el "backend". `doGet` devuelve las
  publicaciones guardadas; `doPost` recibe una publicación nueva, guarda el
  archivo en Drive y agrega la fila en la Sheet.

## Puesta en marcha

1. Editá `data/familiares.json` con los datos reales de tu familia (nombre,
   ciudad, coordenadas — las podés sacar buscando la ciudad en Google Maps
   y copiando lat/long —, zona horaria IANA y una foto de avatar).
2. Seguí [`SETUP.md`](SETUP.md) para activar el histórico de fotos/videos
   (Google Sheet + Apps Script + Drive) — 10-15 minutos, sin necesidad de
   Google Cloud Console.
3. Activá GitHub Pages (también en `SETUP.md`, Paso 5).

## Ideas para seguir aprendiendo / mejorar

- Agregar autenticación real (Google Sign-In) para que solo la familia
  pueda publicar.
- Notificaciones (ej. por email) cuando alguien sube algo nuevo.
- Mostrar el clima actual de cada ciudad además de la hora.
- Mover la lista de familiares también a la Sheet, para poder agregar
  gente sin tocar código.
