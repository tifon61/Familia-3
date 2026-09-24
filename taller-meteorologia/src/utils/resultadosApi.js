import { GOOGLE_SHEET_URL } from './config'
import { todasLasPreguntas } from './analisis'
import { localidades } from '../data/localidades'

// Pide todas las filas al script de Google (doGet con accion=resultados).
// Es un GET simple, así que no hay problema de CORS.
export async function traerResultados(clave) {
  const url = `${GOOGLE_SHEET_URL}?accion=resultados&clave=${encodeURIComponent(clave)}`
  const respuesta = await fetch(url)
  const datos = await respuesta.json()
  if (!datos.ok) throw new Error(datos.error || 'No se pudieron leer los resultados')
  // El script viejo responde ok pero sin "filas": no tiene la parte de resultados
  if (!Array.isArray(datos.filas)) {
    throw new Error('El script de Google es una versión anterior y no puede mostrar resultados. Pegá el Codigo.gs nuevo y publicá una nueva versión.')
  }
  return datos.filas
}

// Datos de ejemplo, para ver cómo queda la página antes de tener respuestas
// reales. Usa un generador pseudoaleatorio con semilla fija: siempre salen
// los mismos datos.
export function datosDeEjemplo(cantidad = 38) {
  let semilla = 7
  const azar = () => {
    semilla = (semilla * 16807) % 2147483647
    return semilla / 2147483647
  }
  const nombres = ['Ana', 'Juan', 'Carla', 'Diego', 'Lucía', 'Martín', 'Sofía', 'Pablo', 'Julieta', 'Nicolás', 'Valeria', 'Tomás']
  const apellidos = ['Pérez', 'Gómez', 'Rodríguez', 'Fernández', 'López', 'Díaz', 'Sosa', 'Romero', 'Álvarez', 'Torres']
  const frases = [
    'Replegar al personal hacia zonas ya quemadas y confirmar rutas de escape antes del cambio de viento.',
    'Mantener comunicación constante con la base, designar un vigía y definir zonas de seguridad.',
    'Evitar la parte alta de la ladera y las chimeneas; trabajar desde el flanco y desde abajo.',
    'Suspender el trabajo en línea ante actividad eléctrica y replegar a vehículos o zonas despejadas.',
    'Aprovechar las primeras horas de la mañana para el ataque directo, con precaución por el humo acumulado.',
    'Monitorear rebrotes durante varios días por posibles árboles con combustión interna.',
  ]
  // Qué tan difícil es cada pregunta (probabilidad de acertar), para que el
  // ejemplo se parezca a algo real.
  const dificultad = [0.85, 0.6, 0.45, 0.75, 0.7]
  const filas = []
  for (let i = 0; i < cantidad; i++) {
    const fila = {
      'ID envío': `ejemplo-${i}`,
      'Fecha de envío': new Date(Date.UTC(2026, 8, 15 + Math.floor(azar() * 8), 12 + Math.floor(azar() * 8), Math.floor(azar() * 60))).toISOString(),
      'Nombre / participantes': `${nombres[Math.floor(azar() * nombres.length)]} ${apellidos[Math.floor(azar() * apellidos.length)]}`,
      'Localidad / base': localidades[Math.floor(Math.pow(azar(), 1.6) * 8)],
    }
    let k = 0
    for (const p of todasLasPreguntas) {
      if (p.tipo === 'opcion') {
        const acierta = azar() < dificultad[k++ % dificultad.length]
        const incorrectas = p.opciones.filter((o) => o.id !== p.correcta)
        const opcion = acierta ? p.opciones.find((o) => o.id === p.correcta) : incorrectas[Math.floor(azar() * incorrectas.length)]
        fila[p.clave] = opcion.texto
        fila[`${p.clave} (resultado)`] = acierta ? 'Correcta' : 'Incorrecta'
      } else {
        fila[p.clave] = frases[Math.floor(azar() * frases.length)]
      }
    }
    filas.push(fila)
  }
  return filas
}
