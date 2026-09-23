import { escenarios } from '../data/escenarios'

// Convierte las filas de la planilla (un objeto { columna: valor } por
// reporte) en estadísticas para la página de resultados.
//
// Los nombres de columna son los mismos que arma src/utils/envio.js:
//   "S1 - Pregunta 1", "S1 - Pregunta 1 (resultado)", "S1 - Decisión operativa"…

const columna = (esc, p) => `S${esc.numero} - ${p.etiqueta}`

// Todas las preguntas de la actividad en una sola lista, con su situación.
export const todasLasPreguntas = escenarios.flatMap((esc) =>
  esc.preguntas.map((p) => ({ ...p, escenario: esc, clave: columna(esc, p), corta: `S${esc.numero} · ${p.etiqueta}` })),
)
export const preguntasOpcion = todasLasPreguntas.filter((p) => p.tipo === 'opcion')
export const preguntasTexto = todasLasPreguntas.filter((p) => p.tipo === 'texto')

// Una fila de la planilla -> un participante con sus respuestas ya interpretadas.
export function interpretarFila(fila, indice) {
  const respuestas = {}
  let correctas = 0
  let respondidas = 0
  for (const p of todasLasPreguntas) {
    const valor = fila[p.clave]
    if (p.tipo === 'opcion') {
      // Buscamos la opción por su texto (es lo que se guarda en la planilla)
      const opcion = p.opciones.find((o) => o.texto === valor)
      const esCorrecta = fila[`${p.clave} (resultado)`] === 'Correcta' || opcion?.id === p.correcta
      if (valor) respondidas += 1
      if (esCorrecta) correctas += 1
      respuestas[p.clave] = { texto: valor ?? '', opcionId: opcion?.id ?? null, correcta: esCorrecta }
    } else {
      respuestas[p.clave] = { texto: valor ?? '' }
    }
  }
  const fecha = fila['Fecha de envío'] ? new Date(fila['Fecha de envío']) : null
  return {
    id: fila['ID envío'] || `fila-${indice}`,
    nombre: String(fila['Nombre / participantes'] ?? '').trim() || '(sin nombre)',
    localidad: String(fila['Localidad / base'] ?? '').trim() || '(sin localidad)',
    fecha: fecha && !Number.isNaN(fecha.getTime()) ? fecha : null,
    correctas,
    total: preguntasOpcion.length,
    porcentaje: preguntasOpcion.length ? correctas / preguntasOpcion.length : 0,
    respondidas,
    respuestas,
  }
}

const promedio = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

// Todas las estadísticas para un grupo de participantes (ya filtrado).
export function calcularEstadisticas(participantes) {
  const n = participantes.length

  const porPregunta = preguntasOpcion.map((p) => {
    const conteo = Object.fromEntries(p.opciones.map((o) => [o.id, 0]))
    let sinResponder = 0
    for (const part of participantes) {
      const r = part.respuestas[p.clave]
      if (r?.opcionId) conteo[r.opcionId] += 1
      else sinResponder += 1
    }
    const correctas = conteo[p.correcta]
    return {
      pregunta: p,
      correctas,
      porcentaje: n ? correctas / n : 0,
      opciones: p.opciones.map((o) => ({ ...o, cantidad: conteo[o.id], porcentaje: n ? conteo[o.id] / n : 0, esCorrecta: o.id === p.correcta })),
      sinResponder,
    }
  })

  const porSituacion = escenarios.map((esc) => {
    const preguntas = porPregunta.filter((x) => x.pregunta.escenario.id === esc.id)
    const total = preguntas.length * n
    const correctas = preguntas.reduce((a, x) => a + x.correctas, 0)
    return { escenario: esc, correctas, total, porcentaje: total ? correctas / total : 0 }
  })

  // Distribución de puntajes: cuántas personas sacaron 0, 1, 2… correctas
  const distribucion = Array.from({ length: preguntasOpcion.length + 1 }, (_, correctas) => ({
    correctas,
    cantidad: participantes.filter((p) => p.correctas === correctas).length,
  }))

  const mapaLocalidades = new Map()
  for (const p of participantes) {
    if (!mapaLocalidades.has(p.localidad)) mapaLocalidades.set(p.localidad, [])
    mapaLocalidades.get(p.localidad).push(p)
  }
  const porLocalidad = [...mapaLocalidades.entries()]
    .map(([localidad, ps]) => ({ localidad, cantidad: ps.length, porcentaje: promedio(ps.map((p) => p.porcentaje)) }))
    .sort((a, b) => b.cantidad - a.cantidad || a.localidad.localeCompare(b.localidad))

  const fechas = participantes.map((p) => p.fecha).filter(Boolean).sort((a, b) => b - a)

  return {
    cantidad: n,
    porcentajePromedio: promedio(participantes.map((p) => p.porcentaje)),
    localidades: porLocalidad.length,
    ultimoEnvio: fechas[0] ?? null,
    porPregunta,
    porSituacion,
    distribucion,
    porLocalidad,
  }
}

export const formatoPorcentaje = (x) => `${Math.round(x * 100)}%`
