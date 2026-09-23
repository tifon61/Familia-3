# Guardar las respuestas en Google Sheets

Cada vez que un brigadista toca **Enviar Reporte**, sus respuestas se guardan
como una fila nueva en una planilla de Google. Se configura una sola vez y
lleva unos 10 minutos.

## 1. Crear la planilla

1. Entrá a <https://sheets.new> (con la cuenta de Google que va a ser dueña de
   las respuestas).
2. Ponele un nombre, por ejemplo **Respuestas Taller Meteorología**.

## 2. Pegar el script

1. En la planilla: menú **Extensiones → Apps Script**.
2. Se abre un editor con un archivo `Código.gs`. Borrá todo lo que tiene.
3. Copiá y pegá el contenido completo de `Codigo.gs` (el archivo que está al
   lado de esta guía).
4. Guardá con el ícono del disquete (o Ctrl+S).

## 3. Publicarlo como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ de "Seleccionar tipo", elegí **Aplicación web**.
3. Completá:
   - **Descripción:** Taller meteorología
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier persona
4. Tocá **Implementar**.
5. Google pide autorización: **Autorizar acceso** → elegí tu cuenta.
   Va a aparecer un aviso de "Google no verificó esta app" (es normal, porque
   el script lo escribiste vos): **Configuración avanzada → Ir a … (no seguro)
   → Permitir**.
6. Copiá la **URL de la aplicación web**. Termina en `/exec`.

**Prueba rápida:** abrí esa URL en el navegador. Tiene que decir
`"El script del taller está funcionando."`

## 4. Conectar la app

1. En el repositorio de GitHub, abrí `index.html` y tocá el lápiz ✏️ (editar).
2. Cerca del principio vas a ver:
   ```js
   googleSheet: '',
   ```
3. Pegá la URL entre las comillas:
   ```js
   googleSheet: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
4. **Commit changes**. En uno o dos minutos GitHub Pages publica el cambio.

## 5. Probar

Hacé la actividad completa y enviá el reporte. En la planilla va a aparecer
una hoja **Respuestas** con los encabezados en azul y tu fila.

## Qué se guarda

Una fila por reporte con: ID del envío, fecha, nombre, localidad, cantidad de
opciones múltiples correctas y, por cada situación, cada respuesta (en las de
opción múltiple, además, si fue correcta o incorrecta).

## Preguntas frecuentes

- **¿Y si falla el envío (sin señal)?** La app avisa y ofrece reintentar. Si
  el reporte ya había llegado, el reintento actualiza la misma fila: no se
  duplica.
- **¿Puedo cambiar el script después?** Sí, pero para que el cambio se
  aplique: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva
  versión → Implementar**. La URL sigue siendo la misma.
- **¿Quién puede ver las respuestas?** Solo quienes tengan acceso a la
  planilla (se comparte como cualquier Google Sheet). La URL del script solo
  permite *agregar* filas, no leerlas. Igual, no la publiques fuera de la app:
  cualquiera que la tenga podría enviar filas.
- **¿Puedo usar Formspree además?** Sí, si completás los dos campos la app
  envía a ambos.
