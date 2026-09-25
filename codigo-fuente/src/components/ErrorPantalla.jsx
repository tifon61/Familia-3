import { Component } from 'react'

// "Error boundary": si algún componente falla al dibujarse, React normalmente
// desmonta TODO y la página queda en blanco. Este componente atrapa el error
// y muestra un aviso con un botón para seguir. Las respuestas no se pierden
// porque ya están guardadas en el navegador.
// (Tiene que ser una clase: React todavía no permite hacer esto con funciones.)
export default class ErrorPantalla extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h2 className="font-titulo text-2xl font-black uppercase text-primario">Algo no se mostró bien</h2>
        <p className="mt-3 text-apagado">
          Tus respuestas están guardadas. Tocá el botón para continuar donde estabas.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-primario px-8 py-3 font-black text-white hover:bg-primario-medio"
        >
          Continuar
        </button>
        <p className="mt-6 text-xs text-apagado">
          Si se repite, avisá a quien coordina el taller con este detalle:
          <code className="mt-1 block break-words rounded bg-white p-2 text-left text-[11px] text-texto">
            {String(this.state.error?.message || this.state.error)}
          </code>
        </p>
      </div>
    )
  }
}
