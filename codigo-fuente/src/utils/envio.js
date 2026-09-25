import { escenarios } from '../data/escenarios'
import { FORMSPREE_URL, GOOGLE_SHEET_URL } from './config'
import { calcularPuntaje, formatearFecha, generarTextoReporte } from './reporte'

export const envioConfigurado = Boolean(FORMSPREE_URL || GOOGLE_SHEET_URL)

// Un identificador único por reporte. Sirve para que Google Sheets no
// duplique la fila si el mismo reporte se envía dos veces.
export function nuevoIdEnvio() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// Las respuestas como lista ordenada de [columna, valor]. El orden importa:
// es el orden de las columnas en la planilla.
function armarCampos({ participante, respuestas, enviadoEn, idEnvio }) {
  const { correctas, total } = calcularPuntaje(respuestas)
  const campos = [
    ['ID envío', idEnvio],
    ['Fecha de envío', enviadoEn],
    ['Nombre / participantes', participante.nombre],
    ['Localidad / base', participante.localidad],
    ['Opción múltiple correctas', `${correctas} de ${total}`],
  ]
  for (const esc of escenarios) {
    for (const p of esc.preguntas) {
      const valor = respuestas[esc.id]?.[p.id]
      const columna = `S${esc.numero} - ${p.etiqueta}`
      if (p.tipo === 'opcion') {
        campos.push([columna, p.opciones.find((o) => o.id === valor)?.texto ?? ''])
        campos.push([`${columna} (resultado)`, valor === p.correcta ? 'Correcta' : 'Incorrecta'])
      } else {
        campos.push([columna, valor ?? ''])
      }
    }
  }
  return campos
}

async function enviarAGoogleSheet(campos) {
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(GOOGLE_SHEET_URL)) {
    throw new Error('La dirección de googleSheet no parece correcta: tiene que empezar con https://script.google.com/ y terminar en /exec.')
  }
  // Content-Type text/plain: así el navegador no hace la consulta previa
  // (CORS "preflight") que Apps Script no sabe responder. El script igual
  // lee el cuerpo como JSON.
  let respuesta
  try {
    respuesta = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ campos }),
    })
  } catch {
    throw new Error('No se pudo conectar con Google. Si hay internet, revisá que en la implementación del script "Quién tiene acceso" sea "Cualquier persona".')
  }
  let datos
  try {
    datos = await respuesta.json()
  } catch {
    // Google devolvió una página (por ejemplo, la de iniciar sesión) en vez de datos
    throw new Error(`Google respondió algo que no es del script (código ${respuesta.status}). Revisá que el acceso sea "Cualquier persona" y que la URL sea la de la última implementación.`)
  }
  if (!datos.ok) throw new Error(`El script de Google dio este error: ${datos.error || 'desconocido'}`)
}

async function enviarAFormspree(campos, datosReporte) {
  const cuerpo = Object.fromEntries(campos)
  cuerpo._subject = `Actividad Final - ${datosReporte.participante.nombre} (${datosReporte.participante.localidad})`
  cuerpo['Fecha de envío'] = formatearFecha(datosReporte.enviadoEn)
  cuerpo['Reporte completo'] = generarTextoReporte(datosReporte)
  const respuesta = await fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!respuesta.ok) throw new Error('Error en Formspree')
}

// Devuelve { estado, detalle }:
//   estado 'enviado' si llegó a todos los destinos configurados, 'error' si
//   alguno falló (detalle explica por qué), o 'local' si no hay ninguno
//   configurado (el reporte se entrega copiándolo o descargándolo).
export async function enviarReporte(datos) {
  if (!envioConfigurado) return { estado: 'local', detalle: null }
  const campos = armarCampos(datos)
  const envios = []
  if (GOOGLE_SHEET_URL) envios.push(enviarAGoogleSheet(campos))
  if (FORMSPREE_URL) envios.push(enviarAFormspree(campos, datos))
  // Promise.allSettled espera a que terminen todos, salgan bien o mal.
  const resultados = await Promise.allSettled(envios)
  const fallas = resultados.filter((r) => r.status === 'rejected').map((r) => r.reason?.message || String(r.reason))
  return fallas.length ? { estado: 'error', detalle: fallas.join(' · ') } : { estado: 'enviado', detalle: null }
}
