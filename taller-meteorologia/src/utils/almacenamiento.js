// Guardamos el progreso en el navegador (localStorage) para que, si se cierra
// la pestaña o se corta la conexión en el campo, no se pierdan las respuestas.
// Todo va envuelto en try/catch porque en modo incógnito o con el
// almacenamiento bloqueado, localStorage puede lanzar errores.
const CLAVE = 'taller-meteo-actividad-final-v1'

export function cargarEstado() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

export function guardarEstado(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // Sin almacenamiento la app sigue funcionando; solo no persiste.
  }
}

export function borrarEstado() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // nada que hacer
  }
}
