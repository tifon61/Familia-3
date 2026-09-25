# Taller de Información Meteorológica — Actividad Final (Patagonia)

App web para brigadistas forestales: 4 situaciones meteorológicas con
preguntas y decisiones operativas, envío de respuestas a Google Sheets y una
página interna de resultados.

## ¿Qué hay en cada carpeta?

| Carpeta | Qué es | ¿Qué hago con esto? |
|---|---|---|
| **`para-subir/`** | La app lista: `index.html` + carpeta `imagenes/` | **Se copia al repo donde se publica la actividad.** Es lo único que va ahí. |
| **`google-sheets/`** | `Codigo.gs` (el script) y `GOOGLE-SHEETS.md` (la guía) | El `Codigo.gs` se pega en **Extensiones → Apps Script** de la planilla. |
| `codigo-fuente/` | El código con el que se genera `para-subir/index.html` | **No se copia a ningún lado.** Solo se usa para hacer cambios. |

## Pasos cada vez que hay una versión nueva

1. Copiar **`para-subir/index.html`** al repo de publicación (reemplazando el anterior).
2. Si cambiaron imágenes, copiar también la carpeta **`para-subir/imagenes/`**.
3. Solo si se avisa que cambió el script: pegar de nuevo **`google-sheets/Codigo.gs`**
   en Apps Script y publicar una **nueva versión** de la implementación.

## Configuración (dentro de `index.html`)

Cerca del principio de `para-subir/index.html`:

```js
googleSheet: 'https://script.google.com/macros/s/…/exec',  // URL del script
```

Si esa línea queda vacía (`''`), la app no envía las respuestas a ninguna
planilla y al final lo avisa.

## Páginas

- **Actividad:** la dirección de la página, tal cual.
- **Resultados (interna):** la misma dirección con `#resultados` al final. Pide
  la `CLAVE_RESULTADOS` que está en `Codigo.gs`.
