import { useCallback, useEffect, useState } from 'react'
import Encabezado from './components/Encabezado'
import Inicio from './components/Inicio'
import Panel from './components/Panel'
import ModalEscenario from './components/ModalEscenario'
import Reporte from './components/Reporte'
import { escenarios, escenarioCompleto } from './data/escenarios'
import { borrarEstado, cargarEstado, guardarEstado } from './utils/almacenamiento'

// Estado inicial de la actividad. Todo lo que la app "recuerda" está acá:
//   pantalla:     'inicio' | 'panel' | 'reporte'
//   participante: { nombre, localidad }
//   respuestas:   { [idEscenario]: { [idPregunta]: valor } }
//   completadas:  { [idEscenario]: true }
const estadoVacio = {
  pantalla: 'inicio',
  participante: null,
  respuestas: {},
  completadas: {},
  enviadoEn: null,
  logo: null,
}

export default function App() {
  // La función dentro de useState solo corre la primera vez: recupera el
  // progreso guardado (si existe) en lugar de arrancar de cero.
  const [estado, setEstado] = useState(() => ({ ...estadoVacio, ...cargarEstado() }))
  const [abierto, setAbierto] = useState(null) // id del escenario en el modal

  // Cada vez que cambia el estado, lo guardamos en el navegador.
  useEffect(() => guardarEstado(estado), [estado])

  // Al cambiar de pantalla, volvemos arriba de todo.
  useEffect(() => window.scrollTo({ top: 0 }), [estado.pantalla])

  const actualizar = (cambios) => setEstado((prev) => ({ ...prev, ...cambios }))

  function responder(idEscenario, idPregunta, valor) {
    setEstado((prev) => {
      const respuestas = {
        ...prev.respuestas,
        [idEscenario]: { ...prev.respuestas[idEscenario], [idPregunta]: valor },
      }
      // Si editan una situación ya completada y dejan una respuesta vacía,
      // vuelve a quedar pendiente.
      const esc = escenarios.find((e) => e.id === idEscenario)
      const completadas = { ...prev.completadas }
      if (completadas[idEscenario] && !escenarioCompleto(esc, respuestas[idEscenario])) {
        delete completadas[idEscenario]
      }
      return { ...prev, respuestas, completadas }
    })
  }

  function reiniciar() {
    if (!window.confirm('¿Seguro que querés borrar todas las respuestas y empezar de nuevo?')) return
    borrarEstado()
    setEstado((prev) => ({ ...estadoVacio, logo: prev.logo })) // el logo se conserva
  }

  // useCallback mantiene la misma función entre renders, así el efecto del
  // modal (que depende de onCerrar) no se vuelve a ejecutar en cada tecla.
  const cerrarModal = useCallback(() => setAbierto(null), [])
  const escenarioAbierto = escenarios.find((e) => e.id === abierto)

  return (
    <div className="min-h-screen text-slate-100">
      <Encabezado logo={estado.logo} onCambiarLogo={(logo) => actualizar({ logo })} />

      {estado.pantalla === 'inicio' && (
        <Inicio
          datosIniciales={estado.participante}
          onComenzar={(participante) => actualizar({ participante, pantalla: 'panel' })}
        />
      )}

      {estado.pantalla === 'panel' && (
        <Panel
          participante={estado.participante}
          respuestas={estado.respuestas}
          completadas={estado.completadas}
          onAbrir={setAbierto}
          onEnviar={() => actualizar({ pantalla: 'reporte', enviadoEn: new Date().toISOString() })}
          onReiniciar={reiniciar}
        />
      )}

      {estado.pantalla === 'reporte' && (
        <Reporte
          participante={estado.participante}
          respuestas={estado.respuestas}
          enviadoEn={estado.enviadoEn}
          onNuevaActividad={reiniciar}
        />
      )}

      {escenarioAbierto && (
        <ModalEscenario
          escenario={escenarioAbierto}
          respuestas={estado.respuestas[escenarioAbierto.id] ?? {}}
          completada={Boolean(estado.completadas[escenarioAbierto.id])}
          onResponder={(idPregunta, valor) => responder(escenarioAbierto.id, idPregunta, valor)}
          onCompletar={() => actualizar({ completadas: { ...estado.completadas, [escenarioAbierto.id]: true } })}
          onCerrar={cerrarModal}
        />
      )}

      <footer className="no-imprimir mx-auto max-w-6xl px-4 pb-8 pt-4 text-center text-xs text-slate-600">
        Actividad de capacitación · Taller de Información Meteorológica para brigadistas forestales
      </footer>
    </div>
  )
}
