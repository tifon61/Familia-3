import { Wind, Gauge, Mountain, CloudLightning } from 'lucide-react'

// Todo el contenido de la actividad vive acá, separado de la interfaz.
// Para cambiar un texto, una opción o agregar una pregunta, se edita este
// archivo y los componentes se adaptan solos.
//
// Tipos de pregunta:
//   'opcion' -> opción múltiple, con `opciones`, `correcta` y `explicacion`
//   'texto'  -> respuesta libre (se exige un mínimo de caracteres)

export const MINIMO_CARACTERES = 20

export const escenarios = [
  {
    id: 'frente-frio',
    numero: 1,
    titulo: 'Frente Frío con Alerta Temprana',
    resumen: 'Ingreso de un frente frío con viento norte previo y alerta amarilla por vientos post-frontales.',
    icono: Wind,
    acento: 'sky',
    visual: 'frente',
    contexto: [
      'Durante la mañana se registra viento del sector norte, cálido y seco, con temperaturas elevadas y humedad relativa en descenso. El pronóstico indica el ingreso de un frente frío desde el sudoeste durante la tarde.',
      'El Servicio Meteorológico emitió una alerta amarilla por vientos intensos post-frontales, con ráfagas que podrían superar los 60 km/h una vez producido el pasaje del frente.',
    ],
    datos: [
      { etiqueta: 'Viento actual', valor: 'N 25 km/h' },
      { etiqueta: 'Temperatura', valor: '31 °C' },
      { etiqueta: 'Humedad relativa', valor: '18 %' },
      { etiqueta: 'Alerta', valor: 'Amarilla · viento', destacado: true },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué cambio a gran escala dominará inmediatamente tras el paso del frente?',
        opciones: [
          { id: 'a', texto: 'El viento norte se intensifica y la temperatura sigue en ascenso.' },
          { id: 'b', texto: 'Rotación brusca del viento al sector sur/sudoeste con ráfagas y descenso de temperatura.' },
          { id: 'c', texto: 'Calma total de viento y aumento de la humedad por varios días.' },
          { id: 'd', texto: 'Rotación del viento al sector este con lluvias persistentes y ascenso térmico.' },
        ],
        correcta: 'b',
        explicacion: 'Al pasar el frente frío, el aire frío desplaza al cálido: el viento rota bruscamente al S/SO, llegan las ráfagas post-frontales y la temperatura desciende. Para el fuego, esto significa que el flanco que venía "tranquilo" puede transformarse de golpe en cabeza.',
      },
      {
        id: 'p2',
        etiqueta: 'Pregunta 2',
        tipo: 'texto',
        enunciado: '¿Qué medidas/precauciones tendrá en función de la alerta amarilla vigente?',
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
    resumen: 'Sistema de alta presión posicionado detrás del frente. Analizá el mapa sinóptico de presión.',
    icono: Gauge,
    acento: 'indigo',
    visual: 'alta',
    contexto: [
      'Tras el pasaje del frente, un sistema de alta presión (anticiclón) se posiciona sobre la región. El mapa sinóptico muestra isobaras amplias y espaciadas alrededor de un centro de 1028 hPa.',
      'Se esperan cielos mayormente despejados, vientos débiles, amplitud térmica marcada y mañanas frescas con posibles inversiones térmicas en los valles.',
    ],
    datos: [
      { etiqueta: 'Presión central', valor: '1028 hPa' },
      { etiqueta: 'Viento', valor: 'Débil, variable' },
      { etiqueta: 'Cielo', valor: 'Despejado' },
      { etiqueta: 'Amplitud térmica', valor: '2 °C → 22 °C', destacado: true },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué situación respecto a la estabilidad/inestabilidad proporciona el sistema de alta presión?',
        opciones: [
          { id: 'a', texto: 'Favorece el ascenso de aire y la inestabilidad, con desarrollo de tormentas.' },
          { id: 'b', texto: 'No influye en la estabilidad; solo modifica la temperatura.' },
          { id: 'c', texto: 'Favorece descenso de aire y estabilidad atmosférica.' },
          { id: 'd', texto: 'Genera inestabilidad solo durante la noche.' },
        ],
        correcta: 'c',
        explicacion: 'En un anticiclón el aire desciende (subsidencia), se comprime y se calienta, lo que inhibe los movimientos verticales: la atmósfera queda estable. Por eso predominan los cielos despejados y las columnas de humo tienden a quedar "planchadas".',
      },
      {
        id: 'p2',
        etiqueta: 'Pregunta 2',
        tipo: 'opcion',
        enunciado: '¿Es necesario que haya reducción de la visibilidad (por ejemplo, nieblas) para que nos encontremos en una situación de estabilidad atmosférica?',
        opciones: [
          { id: 'a', texto: 'Sí, sin niebla ni neblina no puede haber estabilidad.' },
          { id: 'b', texto: 'No, si bien la formación de niebla requiere estabilidad, podemos tener cielo despejado e igual encontrarnos en una situación estable.' },
          { id: 'c', texto: 'Sí, la estabilidad solo existe cuando hay nubosidad baja.' },
          { id: 'd', texto: 'No, porque la niebla solo se forma en situaciones inestables.' },
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
    resumen: 'Día cálido sin viento sinóptico, 15:00 hs. Las laderas del valle se calientan con el sol.',
    icono: Mountain,
    acento: 'emerald',
    visual: 'valle',
    contexto: [
      'Es un día cálido y soleado, sin viento de escala sinóptica (el gradiente de presión es débil). Son las 15:00 hs y las laderas del valle llevan varias horas recibiendo radiación solar directa.',
      'En estas condiciones, las circulaciones locales generadas por el propio relieve pasan a dominar el comportamiento del viento en superficie.',
    ],
    datos: [
      { etiqueta: 'Hora', valor: '15:00 hs' },
      { etiqueta: 'Viento sinóptico', valor: 'Nulo' },
      { etiqueta: 'Temperatura', valor: '29 °C' },
      { etiqueta: 'Laderas', valor: 'En calentamiento', destacado: true },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: 'Según el ciclo diario, ¿qué circulación local dominará a esta hora?',
        opciones: [
          { id: 'a', texto: 'Viento de montaña y ladera - catabático: el aire frío desciende por las laderas hacia el fondo del valle.' },
          { id: 'b', texto: 'Viento de valle y ladera - anabático: el aire cálido asciende paralelo a las laderas hacia las cumbres.' },
          { id: 'c', texto: 'Brisa de mar que ingresa desde la costa hacia el interior.' },
          { id: 'd', texto: 'Calma absoluta: sin viento sinóptico no hay circulación local.' },
        ],
        correcta: 'b',
        explicacion: 'De día, las laderas soleadas calientan el aire en contacto con ellas; ese aire, más liviano, asciende paralelo a la pendiente (viento anabático). De noche el proceso se invierte y el aire frío baja (catabático).',
      },
      {
        id: 'decision',
        etiqueta: 'Decisión operativa',
        tipo: 'texto',
        enunciado: 'El fuego tiende a trepar empujado por esta brisa ascendente de media tarde. ¿Hacia dónde desplegarían el personal y qué zonas de la ladera evitarían?',
        placeholder: 'Indicá zonas seguras, zonas a evitar (chimeneas, parte alta, etc.) y por qué…',
      },
    ],
  },
  {
    id: 'tormenta-seca',
    numero: 4,
    titulo: 'Tormenta de Verano (Seca)',
    resumen: 'Cumulonimbus con baja humedad en superficie, virga y caída de rayos.',
    icono: CloudLightning,
    acento: 'amber',
    visual: 'tormenta',
    contexto: [
      'Jornada de altas temperaturas. Por la tarde se desarrollan cumulonimbus, pero la humedad en superficie es muy baja: la precipitación se evapora antes de llegar al suelo (virga).',
      'Se registra caída de rayos sobre la zona de trabajo. Existe riesgo de combustión interna en árboles alcanzados por descargas, que pueden permanecer latentes y manifestarse horas o días después.',
    ],
    datos: [
      { etiqueta: 'Temperatura', valor: '36 °C' },
      { etiqueta: 'Humedad relativa', valor: '15 %' },
      { etiqueta: 'Precipitación', valor: 'Virga (no llega)' },
      { etiqueta: 'Actividad eléctrica', valor: 'Activa', destacado: true },
    ],
    preguntas: [
      {
        id: 'p1',
        etiqueta: 'Pregunta 1',
        tipo: 'opcion',
        enunciado: '¿Qué consecuencias puede presentar esta situación?',
        opciones: [
          { id: 'a', texto: 'Lluvias abundantes que eliminan el riesgo de incendio.' },
          { id: 'b', texto: 'Ninguna, porque si la lluvia no llega al suelo la tormenta no tiene efectos.' },
          { id: 'c', texto: 'Posible caída de rayos sobre combustible seco y riesgo para la vida, presencia de ráfagas.' },
          { id: 'd', texto: 'Solo un descenso leve de la temperatura, sin riesgos operativos.' },
        ],
        correcta: 'c',
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
// válida: una opción elegida, o un texto con el mínimo de caracteres.
export function preguntaRespondida(pregunta, valor) {
  if (pregunta.tipo === 'opcion') return Boolean(valor)
  return typeof valor === 'string' && valor.trim().length >= MINIMO_CARACTERES
}

export function escenarioCompleto(escenario, respuestas = {}) {
  return escenario.preguntas.every((p) => preguntaRespondida(p, respuestas[p.id]))
}
