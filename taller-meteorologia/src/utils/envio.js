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
  // Content-Type text/plain: así el navegador no hace la consulta previa
  // (CORS "preflight") que Apps Script no sabe responder. El script igual
  // lee el cuerpo como JSON.
  const respuesta = await fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ campos }),
  })
  const datos = await respuesta.json()
  if (!datos.ok) throw new Error(datos.error || 'Error en Google Sheets')
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

// Devuelve 'enviado' si llegó a todos los destinos configurados, 'error' si
// alguno falló, o 'local' si no hay ninguno configurado (en ese caso el
// reporte se entrega copiándolo o descargándolo).
export async function enviarReporte(datos) {
  if (!envioConfigurado) return 'local'
  const campos = armarCampos(datos)
  const envios = []
  if (GOOGLE_SHEET_URL) envios.push(enviarAGoogleSheet(campos))
  if (FORMSPREE_URL) envios.push(enviarAFormspree(campos, datos))
  // Promise.allSettled espera a que terminen todos, salgan bien o mal.
  const resultados = await Promise.allSettled(envios)
  return resultados.every((r) => r.status === 'fulfilled') ? 'enviado' : 'error'
}
