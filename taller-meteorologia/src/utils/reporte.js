import { escenarios } from '../data/escenarios'

// Cuenta cuántas preguntas de opción múltiple se respondieron bien.
export function calcularPuntaje(respuestas) {
  let correctas = 0
  let total = 0
  for (const esc of escenarios) {
    for (const p of esc.preguntas) {
      if (p.tipo !== 'opcion') continue
      total += 1
      if (respuestas[esc.id]?.[p.id] === p.correcta) correctas += 1
    }
  }
  return { correctas, total }
}

export function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
}

// Arma el reporte como texto plano, prolijo para pegar en un mail, WhatsApp
// o guardar como .txt.
export function generarTextoReporte({ participante, respuestas, enviadoEn }) {
  const linea = '='.repeat(64)
  const sublinea = '-'.repeat(64)
  const { correctas, total } = calcularPuntaje(respuestas)
  const partes = [
    linea,
    'TALLER DE INFORMACIÓN METEOROLÓGICA - ACTIVIDAD FINAL',
    'Reporte de situaciones operativas',
    linea,
    `Brigadista / participantes: ${participante.nombre}`,
    `Localidad / base operativa: ${participante.localidad}`,
    `Fecha de envío:             ${formatearFecha(enviadoEn)}`,
    `Opción múltiple:            ${correctas} de ${total} correctas`,
    '',
  ]

  for (const esc of escenarios) {
    partes.push(sublinea, `SITUACIÓN ${esc.numero}: ${esc.titulo.toUpperCase()}`, sublinea)
    for (const p of esc.preguntas) {
      const valor = respuestas[esc.id]?.[p.id]
      partes.push(`${p.etiqueta}: ${p.enunciado}`)
      if (p.tipo === 'opcion') {
        const elegida = p.opciones.find((o) => o.id === valor)
        const ok = valor === p.correcta
        partes.push(`  Respuesta: ${elegida ? elegida.texto : '(sin responder)'}`)
        partes.push(`  Resultado: ${ok ? 'CORRECTA' : 'INCORRECTA'}`)
        if (!ok) {
          const correcta = p.opciones.find((o) => o.id === p.correcta)
          partes.push(`  Respuesta esperada: ${correcta.texto}`)
        }
      } else {
        partes.push(`  Respuesta: ${(valor || '').trim()}`)
      }
      partes.push('')
    }
  }
  partes.push(linea)
  return partes.join('\n')
}

export function nombreArchivo(participante) {
  const base = participante.nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `reporte-actividad-final-${base || 'brigada'}.txt`
}
