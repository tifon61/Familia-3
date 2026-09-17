# Guía de configuración (paso a paso)

Esta app tiene dos partes:

1. **El sitio** (mapa + relojes + perfiles) — no necesita configuración, se publica solo con GitHub Pages.
2. **El backend de fotos/videos** — corre gratis en tu cuenta de Google usando Google Apps Script + una Google Sheet + una carpeta de Drive. Estos son los pasos para activarlo.

No hace falta crear credenciales OAuth ni tocar Google Cloud Console: Apps Script se ocupa de eso por vos.

## Paso 1 — Crear la carpeta de Drive

1. Entrá a [Google Drive](https://drive.google.com) con la cuenta que va a "ser dueña" del álbum familiar (puede ser la tuya).
2. Creá una carpeta nueva, por ejemplo `Familia - Fotos y Videos`.
3. Abrila y copiá el ID de la carpeta: es la parte de la URL después de `/folders/`.
   Ejemplo: `https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrSt` → el ID es `1AbCdEfGhIjKlMnOpQrSt`.

## Paso 2 — Crear la Google Sheet + el script

1. Entrá a [Google Sheets](https://sheets.google.com) y creá una planilla nueva, por ejemplo `Familia - Base de datos`.
2. Menú **Extensiones → Apps Script**. Se abre un editor de código en una pestaña nueva.
3. Borrá el contenido de `Code.gs` que aparece por defecto y pegá todo el contenido del archivo [`google-apps-script/Code.gs`](google-apps-script/Code.gs) de este repositorio.
4. En la línea `const FOLDER_ID = "PON_AQUI_EL_ID_DE_TU_CARPETA_DE_DRIVE";` reemplazá el texto por el ID que copiaste en el Paso 1.
5. Guardá el proyecto (ícono de disquete, o `Ctrl+S`).

## Paso 3 — Publicar el script como aplicación web

1. En el editor de Apps Script, arriba a la derecha: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Configuración:
   - **Ejecutar como**: Yo (tu cuenta).
   - **Quién tiene acceso**: Cualquier usuario.
     (Esto es lo que permite que la app lea/escriba sin que cada familiar tenga que iniciar sesión en Google. Como el link no se publica en ningún buscador, en la práctica solo lo va a usar tu familia.)
4. Hacé clic en **Implementar**. Google te va a pedir autorizar el script la primera vez (es tu propio script, es seguro aceptarlo).
5. Copiá la **URL de la aplicación web** que te muestra al final (termina en `/exec`).

## Paso 4 — Conectar el sitio con el script

1. Abrí `assets/js/config.js` en este repositorio.
2. Pegá la URL copiada en el paso anterior:

   ```js
   window.APP_CONFIG = {
     APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec"
   };
   ```

3. Guardá, hacé commit y push. Listo: en cada perfil ya vas a poder subir fotos/videos y van a aparecer en el histórico de todos.

## Paso 5 — Publicar el sitio en GitHub Pages

1. En GitHub, andá a **Settings → Pages** del repositorio.
2. En **Source**, elegí la rama principal (`main`) y carpeta `/ (root)`.
3. Guardá. GitHub te va a dar una URL tipo `https://tifon61.github.io/familia-3/` en unos minutos.

## Notas y límites a tener en cuenta

- **Tamaño de archivos**: Apps Script acepta hasta ~50 MB por request. Para videos largos, mejor subilos directo a la carpeta de Drive desde la app de Drive y, si querés que aparezcan en el histórico, agregá una fila manual en la hoja "Publicaciones" con el `driveUrl` correspondiente.
- **Seguridad**: cualquiera que tenga el link de tu sitio puede subir contenido (no hay login). Para una app familiar privada suele ser aceptable, pero si querés más control, la opción "Quién tiene acceso" del Paso 3 se puede cambiar a "Cualquier usuario de Google" — en ese caso cada familiar necesita iniciar sesión con Google para publicar.
- **Editar quién sale en el mapa**: se edita directamente en [`data/familiares.json`](data/familiares.json) (nombre, ciudad, coordenadas, zona horaria, avatar, bio).
