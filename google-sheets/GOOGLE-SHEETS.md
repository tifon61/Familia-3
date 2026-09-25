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
4. Cerca del principio, cambiá la clave para ver resultados por una propia:
   ```js
   const CLAVE_RESULTADOS = "cambiar-esta-clave";   // ← poné otra, ej. "brigada-bolson-26"
   ```
   Mientras diga `cambiar-esta-clave`, la página de resultados no muestra nada.
5. Guardá con el ícono del disquete (o Ctrl+S).

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
una pestaña **Respuestas taller patagonia** con los encabezados en azul y tu fila.

## 6. Ver los resultados

Abrí la dirección de la app agregando `#resultados` al final, por ejemplo:

```
https://usuario.github.io/repositorio/#resultados
```

Pide la clave (`CLAVE_RESULTADOS`) una vez y la recuerda en ese navegador.
Muestra el porcentaje de aciertos promedio, aciertos por situación y por
pregunta, qué opción eligió cada uno, resultados por localidad, la lista de
participantes (tocando una fila se ven todas sus respuestas) y las respuestas
de texto libre agrupadas por pregunta. Se puede filtrar por localidad.

No hay ningún botón en la app que lleve ahí: solo entra quien conoce la
dirección y la clave. Sin la planilla configurada, esa página muestra datos de
ejemplo para ver cómo queda.

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
- **¿Quién puede ver las respuestas?** Quienes tengan acceso a la planilla, y
  quienes sepan la `CLAVE_RESULTADOS` (desde la página de resultados). Sin la
  clave, la URL del script solo permite *agregar* filas. No publiques la URL
  fuera de la app: cualquiera que la tenga podría enviar filas.
- **Cambié la clave y no funciona.** Después de editar el script hay que
  publicar una nueva versión (ver la pregunta anterior).
- **¿Puedo usar Formspree además?** Sí, si completás los dos campos la app
  envía a ambos.
