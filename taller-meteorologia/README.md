# Taller de Información Meteorológica - Actividad Final

App web interactiva para brigadistas forestales: 4 escenarios meteorológicos
con preguntas y decisiones operativas, y un reporte final para entregar.

Hecha con **React** (interfaz), **Tailwind CSS** (estilos) y **Lucide** (íconos),
empaquetada con **Vite**.

## Cómo correrla

```bash
cd taller-meteorologia
npm install      # instala dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo con recarga automática
npm run build    # genera la versión final en ../meteo
```

La versión compilada se guarda en la carpeta `meteo/` de la raíz del repo, así
GitHub Pages la sirve directamente en `https://<usuario>.github.io/<repo>/meteo/`
sin necesitar un paso de compilación en el servidor. **Después de cambiar el
código hay que volver a correr `npm run build` y commitear `meteo/`.**

## Cómo está organizado

```
src/
  main.jsx                 punto de entrada: monta <App /> en la página
  App.jsx                  estado global y qué pantalla se muestra
  data/
    escenarios.js          TODO el contenido: contextos, preguntas, opciones y correctas
    estilos.js             colores de acento de cada situación
  components/
    Encabezado.jsx         título + espacio para el logo (clic para cargarlo)
    Inicio.jsx             formulario de nombre y base operativa
    Panel.jsx              las 4 tarjetas con estado y el botón Enviar Reporte
    ModalEscenario.jsx     detalle de cada situación con su formulario
    Visuales.jsx           mapas y esquemas dibujados en SVG
    Reporte.jsx            pantalla de éxito, copiar / descargar / imprimir
  utils/
    almacenamiento.js      guarda el progreso en el navegador (localStorage)
    reporte.js             arma el reporte en texto plano y calcula el puntaje
```

### Ideas clave para entender el código

- **Datos separados de la interfaz.** Para cambiar una pregunta o agregar una
  opción, solo se edita `src/data/escenarios.js`; los componentes recorren esa
  lista con `.map()` y dibujan lo que haya.
- **Un único estado en `App.jsx`.** Guarda la pantalla actual, los datos del
  participante, las respuestas y qué situaciones están completas. Los
  componentes hijos reciben datos por *props* y avisan cambios con funciones
  (`onResponder`, `onCompletar`, …).
- **Autoguardado.** Un `useEffect` guarda el estado en `localStorage` cada vez
  que cambia, así no se pierde nada si se cierra la pestaña.
- **Completar una situación** exige responder todas las preguntas (textos de
  al menos 20 caracteres). Recién ahí se muestra la corrección de las
  preguntas de opción múltiple, con una explicación, y esas opciones quedan
  bloqueadas.
- **Tailwind y clases dinámicas.** Tailwind solo incluye las clases que ve
  escritas completas, por eso los colores por situación están listados en
  `estilos.js` en lugar de armarse con `` `text-${color}-400` ``.
