import { useCallback, useEffect, useState } from 'react'
import Encabezado from './components/Encabezado'
import Inicio from './components/Inicio'
import Panel from './components/Panel'
import ModalEscenario from './components/ModalEscenario'
import Reporte from './components/Reporte'
import { escenarios, escenarioCompleto } from './data/escenarios'
import { borrarEstado, cargarEstado, guardarEstado } from './utils/almacenamiento'
import { enviarReporte, nuevoIdEnvio } from './utils/envio'

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
  estadoEnvio: null, // 'enviado' | 'error' | 'local'
  idEnvio: null, // se crea una sola vez, así un reintento no duplica la fila
  logo: null,
}

export default function App() {
  // La función dentro de useState solo corre la primera vez: recupera el
  // progreso guardado (si existe) en lugar de arrancar de cero.
  const [estado, setEstado] = useState(() => ({ ...estadoVacio, ...cargarEstado() }))
  const [abierto, setAbierto] = useState(null) // id del escenario en el modal
  const [enviando, setEnviando] = useState(false)

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

  // async/await: esperamos la respuesta del servidor antes de seguir.
  async function enviar() {
    setEnviando(true)
    const enviadoEn = estado.enviadoEn ?? new Date().toISOString()
    const idEnvio = estado.idEnvio ?? nuevoIdEnvio()
    const estadoEnvio = await enviarReporte({ participante: estado.participante, respuestas: estado.respuestas, enviadoEn, idEnvio })
    setEnviando(false)
    actualizar({ pantalla: 'reporte', enviadoEn, idEnvio, estadoEnvio })
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
    <div className="flex min-h-screen flex-col">
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
          enviando={enviando}
          onEnviar={enviar}
          onReiniciar={reiniciar}
        />
      )}

      {estado.pantalla === 'reporte' && (
        <Reporte
          participante={estado.participante}
          respuestas={estado.respuestas}
          enviadoEn={estado.enviadoEn}
          estadoEnvio={estado.estadoEnvio}
          enviando={enviando}
          onReintentar={enviar}
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

      <footer className="no-imprimir mt-auto border-t border-borde bg-white px-4 py-4 text-center text-xs font-semibold text-apagado">
        Actividad de capacitación · Taller de Información Meteorológica para brigadistas forestales
      </footer>
    </div>
  )
}
