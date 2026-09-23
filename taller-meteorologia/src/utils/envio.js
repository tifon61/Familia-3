import { escenarios } from '../data/escenarios'
import { FORMSPREE_URL } from './config'
import { calcularPuntaje, generarTextoReporte } from './reporte'

export const envioConfigurado = Boolean(FORMSPREE_URL)

// Arma los campos que le llegan por mail a quien administra Formspree.
// Cada respuesta va en su propio campo con un nombre legible.
function armarCampos({ participante, respuestas, enviadoEn }) {
  const { correctas, total } = calcularPuntaje(respuestas)
  const campos = {
    _subject: `Actividad Final - ${participante.nombre} (${participante.localidad})`,
    'Nombre / participantes': participante.nombre,
    'Localidad / base': participante.localidad,
    'Opción múltiple': `${correctas} de ${total} correctas`,
  }
  for (const esc of escenarios) {
    for (const p of esc.preguntas) {
      const valor = respuestas[esc.id]?.[p.id]
      const texto = p.tipo === 'opcion'
        ? `${p.opciones.find((o) => o.id === valor)?.texto ?? ''} [${valor === p.correcta ? 'CORRECTA' : 'INCORRECTA'}]`
        : valor
      campos[`S${esc.numero} - ${p.etiqueta}`] = texto
    }
  }
  campos['Reporte completo'] = generarTextoReporte({ participante, respuestas, enviadoEn })
  return campos
}

// Devuelve 'enviado' si llegó, 'error' si falló, o 'local' si no hay
// Formspree configurado (en ese caso el reporte se entrega copiándolo o
// descargándolo).
export async function enviarReporte(datos) {
  if (!envioConfigurado) return 'local'
  try {
    const respuesta = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(armarCampos(datos)),
    })
    return respuesta.ok ? 'enviado' : 'error'
  } catch {
    return 'error' // sin conexión, URL mal escrita, etc.
  }
}
