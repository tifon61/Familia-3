import { Wind, Gauge, Mountain, CloudLightning } from 'lucide-react'

// Todo el contenido de la actividad vive acá, separado de la interfaz.
// Para cambiar un texto, una opción o agregar una pregunta, se edita este
// archivo y los componentes se adaptan solos.
//
// Tipos de pregunta:
//   'opcion' -> opción múltiple, con `opciones`, `correcta` y `explicacion`
//   'texto'  -> respuesta libre (cualquier largo, pero no vacía)
//
// `imagenes`: archivos dentro de la carpeta imagenes/ del sitio. Si alguno no
// existe, simplemente no se muestra.

export const escenarios = [
  {
    id: 'frente-frio',
    numero: 1,
    titulo: 'Frente Frío con Alerta Temprana',
    resumen: 'Ingreso de un frente frío con viento norte previo y alerta amarilla por vientos para el día posterior.',
    icono: Wind,
    acento: 'oscuro',
    // Sin esquema animado (se usan solo las imágenes reales)
    visual: null,
    contexto: [
      'En la región, se espera el ingreso de un frente frío durante las próximas horas. Previo al pasaje del frente observamos viento norte y temperaturas elevadas. Para el día posterior al pasaje del frente se emite un alerta amarilla por vientos.',
    ],
    datos: [
      { etiqueta: 'Viento previo', valor: 'Sector norte' },
      { etiqueta: 'Temperatura previa', valor: 'Elevada' },
      { etiqueta: 'Sistema', valor: 'Frente frío' },
      { etiqueta: 'Alerta', valor: 'Amarilla · viento', destacado: true },
    ],
    alerta: {
      titulo: 'Alerta amarilla por viento',
      items: [
        '30-50 km/h con ráfagas ≥ 70 km/h (región cuyana)',
        '70-90 km/h con ráfagas ≥ 120 km/h (cordillera)',
        '40-60 km/h con ráfagas ≥ 90 km/h (región patagónica)',
      ],
    },
    imagenes: [
      { archivo: 'situacion-1-alerta-viento.jpg', titulo: 'Alerta por viento', fuente: 'Servicio Meteorológico Nacional' },
      { archivo: 'situacion-1-satelite.jpg', titulo: 'Imagen satelital GOES-19, canal 13 (infrarrojo)', fuente: 'SMN Argentina' },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué cambio a gran escala dominará tras el paso del frente?',
        opciones: [
          { id: 'a', texto: 'Rotación brusca del viento al sector sur/sudoeste con ráfagas y descenso de temperatura.' },
          { id: 'b', texto: 'Aumento de la temperatura y disminución paulatina del viento.' },
          { id: 'c', texto: 'El viento rotará al este aportando humedad a la región.' },
        ],
        correcta: 'a',
        explicacion: 'Al pasar el frente frío, el aire frío desplaza al cálido: el viento rota bruscamente al S/SO, llegan las ráfagas post-frontales y la temperatura desciende. Para el fuego, esto significa que el flanco que venía "tranquilo" puede transformarse de golpe en cabeza.',
      },
      {
        id: 'p2',
        etiqueta: 'Pregunta 2',
        tipo: 'texto',
        enunciado: '¿Qué medidas/precauciones tendrá en cuenta en función de la alerta amarilla vigente?',
        placeholder: 'Ej.: comunicaciones, horarios, puntos de encuentro, monitoreo del viento…',
      },
      {
        id: 'decision',
        etiqueta: 'Decisión operativa',
        tipo: 'texto',
        enunciado: 'Teniendo en cuenta el comportamiento del fuego ante un cambio repentino de viento, ¿qué acciones de seguridad y repliegue priorizarían antes de que llegue el frente?',
        placeholder: 'Describí las acciones concretas, en orden de prioridad…',
      },
    ],
  },
  {
    id: 'alta-post-frontal',
    numero: 2,
    titulo: 'Alta Presión Post Frontal',
    resumen: 'Luego del pasaje de un frente frío se posiciona un sistema de alta presión en la región.',
    icono: Gauge,
    acento: 'celeste',
    visual: 'alta',
    contexto: [
      'Luego del pasaje de un frente frío se posiciona un sistema de alta presión en la región.',
    ],
    datos: [
      { etiqueta: 'Sistema', valor: 'Alta presión' },
      { etiqueta: 'Momento', valor: 'Post frontal' },
    ],
    imagenes: [
      { archivo: 'situacion-2-mapa-presion.jpg', titulo: 'Presión en superficie (isobaras)', fuente: 'Windy.com' },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué situación respecto a la estabilidad/inestabilidad proporciona el sistema de alta presión?',
        opciones: [
          { id: 'a', texto: 'Favorece descenso de aire y estabilidad atmosférica.' },
          { id: 'b', texto: 'Favorece ascenso de aire e inestabilidad atmosférica.' },
        ],
        correcta: 'a',
        explicacion: 'En un anticiclón el aire desciende (subsidencia), se comprime y se calienta, lo que inhibe los movimientos verticales: la atmósfera queda estable. Por eso predominan los cielos despejados y las columnas de humo tienden a quedar "planchadas".',
      },
      {
        id: 'p2',
        etiqueta: 'Pregunta 2',
        tipo: 'opcion',
        enunciado: '¿Es necesario que haya reducción de la visibilidad (por ejemplo, nieblas) para que nos encontremos en una situación de estabilidad atmosférica?',
        opciones: [
          { id: 'a', texto: 'Sí, si no hay niebla es una situación inestable.' },
          { id: 'b', texto: 'No, si bien la formación de la niebla requiere de estabilidad atmosférica, podemos tener cielos despejados e igual encontrarnos en una situación estable.' },
        ],
        correcta: 'b',
        explicacion: 'La niebla es una consecuencia posible de la estabilidad, no una condición necesaria. Un día soleado y despejado bajo un anticiclón es, justamente, un ejemplo típico de atmósfera estable.',
      },
      {
        id: 'decision',
        etiqueta: 'Decisión operativa',
        tipo: 'texto',
        enunciado: 'Teniendo en cuenta la relación entre el comportamiento del fuego y la estabilidad atmosférica, ¿qué acciones llevarían a cabo para el manejo de los focos de incendio?',
        placeholder: 'Pensá en horarios de ataque, humo acumulado, inversiones, visibilidad…',
      },
    ],
  },
  {
    id: 'mesoescala-valle',
    numero: 3,
    titulo: 'Mesoescala: Circulación de Valle',
    resumen: 'Día cálido sin viento sinóptico, 15:00 hs. El sol calienta el fondo del valle y sus laderas.',
    icono: Mountain,
    acento: 'verde',
    visual: 'valle',
    contexto: [
      'Día cálido sin viento sinóptico dominante. Son las 15:00 hs, el sol calienta intensamente el fondo de un valle y sus laderas adyacentes.',
    ],
    datos: [
      { etiqueta: 'Día', valor: 'Cálido' },
      { etiqueta: 'Viento sinóptico', valor: 'Sin viento dominante' },
    ],
    // Todavía sin imagen: si suben este archivo, aparece solo.
    imagenes: [
      { archivo: 'situacion-3-valle.jpg', titulo: 'Circulación de valle y ladera' },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: 'Según el ciclo diario, ¿qué circulación local dominará a esta hora?',
        opciones: [
          { id: 'a', texto: 'Viento de valle y ladera (anabático): el aire cálido asciende paralelo a las laderas hacia las cumbres.' },
          { id: 'b', texto: 'Viento catabático: el aire frío desciende bruscamente de las cumbres hacia el valle.' },
          { id: 'c', texto: 'La radiación solar anula los vientos, dejando la zona en calma.' },
        ],
        correcta: 'a',
        explicacion: 'De día, las laderas soleadas calientan el aire en contacto con ellas; ese aire, más liviano, asciende paralelo a la pendiente (viento anabático). De noche el proceso se invierte y el aire frío baja (catabático).',
      },
      {
        id: 'decision',
        etiqueta: 'Decisión operativa',
        tipo: 'texto',
        enunciado: '¿Hacia dónde desplegarían el personal y qué zonas de la ladera evitarían, teniendo en cuenta el movimiento del aire forzado por el calentamiento?',
        placeholder: 'Indicá zonas seguras, zonas a evitar (chimeneas, parte alta, etc.) y por qué…',
      },
    ],
  },
  {
    id: 'tormenta-seca',
    numero: 4,
    titulo: 'Tormenta de Verano (Seca)',
    resumen: 'Cumulonimbus con humedad muy baja en superficie: la precipitación no llega al suelo (virga).',
    icono: CloudLightning,
    acento: 'medio',
    // Sin esquema animado (se usan solo las imágenes reales)
    visual: null,
    contexto: [
      'Se espera un día con altas temperaturas. Mucha inestabilidad desarrolla nubes cumulonimbus. Sin embargo, la humedad relativa en superficie es muy baja y la precipitación no llega al suelo (virga).',
      'Los rayos que caen sobre árboles pueden generar combustión interna: el fuego queda latente dentro del tronco y puede manifestarse horas después.',
    ],
    datos: [
      { etiqueta: 'Temperatura', valor: 'Alta' },
      { etiqueta: 'Nubes', valor: 'Cumulonimbus' },
      { etiqueta: 'Humedad en superficie', valor: 'Muy baja' },
      { etiqueta: 'Precipitación', valor: 'No alcanza el suelo', destacado: true },
    ],
    imagenes: [
      { archivo: 'situacion-4-ciclo-tormenta.jpg', titulo: 'Etapas de una tormenta unicelular' },
      { archivo: 'situacion-4-combustion-interna.jpg', titulo: 'El impacto del rayo y la combustión interna' },
      { archivo: 'situacion-4-arbol-1.jpg', titulo: 'Combustión interna en un tronco' },
      { archivo: 'situacion-4-arbol-2.jpg', titulo: 'Árbol ardiendo por dentro tras un rayo' },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué consecuencias puede presentar esta situación?',
        opciones: [
          { id: 'a', texto: 'Generación inmediata de un frente cálido que arrastre el fuego hacia el sur.' },
          { id: 'b', texto: 'Posible caída de rayos sobre combustible seco.' },
          { id: 'c', texto: 'Aumento sostenido de la humedad ambiente que limite el avance del fuego.' },
        ],
        correcta: 'b',
        explicacion: 'Una tormenta seca combina lo peor: rayos que encuentran combustible seco (nuevas igniciones y riesgo directo para las personas) y corrientes descendentes que, al evaporar la virga, se enfrían, aceleran y llegan al suelo como ráfagas erráticas.',
      },
      {
        id: 'p2',
        etiqueta: 'Pregunta 2',
        tipo: 'texto',
        enunciado: 'Si tuvimos tormentas sin precipitación, ¿qué riesgo respecto a los incendios podría presentarse?',
        placeholder: 'Pensá en lo que puede pasar en las horas y días siguientes…',
      },
      {
        id: 'decision',
        etiqueta: 'Decisión operativa',
        tipo: 'texto',
        enunciado: 'Ante actividad eléctrica y riesgo de ráfagas erráticas en todas direcciones, ¿qué instrucciones de repliegue o seguridad imparten a las cuadrillas en línea?',
        placeholder: 'Instrucciones concretas para las cuadrillas: dónde ir, qué evitar, cómo comunicarse…',
      },
    ],
  },
]

// Una situación está completa cuando todas sus preguntas tienen respuesta
// válida: una opción elegida, o un texto que no esté vacío.
export function preguntaRespondida(pregunta, valor) {
  if (pregunta.tipo === 'opcion') return Boolean(valor)
  return typeof valor === 'string' && valor.trim().length > 0
}

export function escenarioCompleto(escenario, respuestas = {}) {
  return escenario.preguntas.every((p) => preguntaRespondida(p, respuestas[p.id]))
}
