import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, XCircle, Save, ClipboardList, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react'
import VisualEscenario from './Visuales'
import { MINIMO_CARACTERES, escenarioCompleto, preguntaRespondida } from '../data/escenarios'
import { acentos } from '../data/estilos'

// Vista de detalle de una situación. Las respuestas se guardan en el estado
// global a medida que se escriben (autoguardado); el botón final valida que
// todo esté respondido y marca la situación como completada.
export default function ModalEscenario({ escenario, respuestas, completada, onResponder, onCompletar, onCerrar }) {
  const [intentado, setIntentado] = useState(false)
  const contenedor = useRef(null)
  const estilo = acentos[escenario.acento]
  const { icono: Icono } = escenario

  // Efectos de "modal": bloquear el scroll de fondo, cerrar con Escape y
  // llevar el foco al modal al abrirlo (accesibilidad con teclado).
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    contenedor.current?.focus()
    const alPresionar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', alPresionar)
    }
  }, [onCerrar])

  function completar() {
    setIntentado(true)
    if (!escenarioCompleto(escenario, respuestas)) {
      // Llevamos la vista a la primera pregunta sin responder
      const primera = escenario.preguntas.find((p) => !preguntaRespondida(p, respuestas[p.id]))
      document.getElementById(`${escenario.id}-${primera.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onCompletar()
    contenedor.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        ref={contenedor}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-escenario"
        onClick={(e) => e.stopPropagation()}
        className="animar-entrada relative w-full max-w-6xl overflow-y-auto bg-slate-950 outline-none sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-slate-700"
      >
        {/* Cabecera del modal */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${estilo.icono}`}>
            <Icono className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold uppercase tracking-wider ${estilo.texto}`}>Situación {escenario.numero}</p>
            <h2 id="titulo-escenario" className="truncate font-bold text-white sm:text-lg">{escenario.titulo}</h2>
          </div>
          <button onClick={onCerrar} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {completada && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 sm:mx-6">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
            Situación completada. Abajo vas a ver la corrección de las preguntas de opción múltiple. Podés seguir editando tus respuestas de texto.
          </div>
        )}

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Columna izquierda: contexto meteorológico y recursos visuales */}
          <section className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <ClipboardList className="h-4 w-4" /> Contexto meteorológico
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              {escenario.contexto.map((parrafo, i) => <p key={i}>{parrafo}</p>)}
            </div>
            <dl className="grid grid-cols-2 gap-2">
              {escenario.datos.map((d) => (
                <div key={d.etiqueta} className={`rounded-lg border px-3 py-2 ${d.destacado ? 'border-amber-500/40 bg-amber-500/10' : 'border-slate-800 bg-slate-900'}`}>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">{d.etiqueta}</dt>
                  <dd className={`font-semibold ${d.destacado ? 'text-amber-200' : 'text-white'}`}>{d.valor}</dd>
                </div>
              ))}
            </dl>
            <VisualEscenario tipo={escenario.visual} />
          </section>

          {/* Columna derecha: formulario */}
          <section className="space-y-5">
            {escenario.preguntas.map((p) => (
              <Pregunta
                key={p.id}
                id={`${escenario.id}-${p.id}`}
                pregunta={p}
                valor={respuestas[p.id]}
                onCambio={(v) => onResponder(p.id, v)}
                mostrarCorreccion={completada}
                mostrarError={intentado && !preguntaRespondida(p, respuestas[p.id])}
              />
            ))}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
              <button onClick={onCerrar} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" /> Volver al panel
              </button>
              {!completada && (
                <button onClick={completar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500">
                  <Save className="h-4 w-4" /> Guardar y marcar como completada
                </button>
              )}
            </div>
            {!completada && (
              <p className="text-right text-xs text-slate-500">Tus respuestas se guardan automáticamente mientras escribís.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Pregunta({ id, pregunta, valor, onCambio, mostrarCorreccion, mostrarError }) {
  const esDecision = pregunta.etiqueta === 'Decisión operativa'
  return (
    <fieldset
      id={id}
      className={`rounded-2xl border p-4 sm:p-5 ${
        mostrarError ? 'border-red-500/60 bg-red-500/5' : esDecision ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800 bg-slate-900/70'
      }`}
    >
      <legend className="sr-only">{pregunta.etiqueta}</legend>
      <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${esDecision ? 'text-orange-300' : 'text-sky-300'}`}>
        {esDecision && <AlertTriangle className="h-3.5 w-3.5" />}
        {pregunta.etiqueta} · {pregunta.tipo === 'opcion' ? 'Opción múltiple' : 'Texto libre'}
      </p>
      <p className="mt-2 font-medium text-white">{pregunta.enunciado}</p>

      {pregunta.tipo === 'opcion' ? (
        <OpcionMultiple id={id} pregunta={pregunta} valor={valor} onCambio={onCambio} mostrarCorreccion={mostrarCorreccion} />
      ) : (
        <TextoLibre id={id} pregunta={pregunta} valor={valor ?? ''} onCambio={onCambio} />
      )}

      {mostrarError && (
        <p className="mt-2 text-xs text-red-400">
          {pregunta.tipo === 'opcion' ? 'Elegí una opción.' : `Escribí una respuesta de al menos ${MINIMO_CARACTERES} caracteres.`}
        </p>
      )}
    </fieldset>
  )
}

function OpcionMultiple({ id, pregunta, valor, onCambio, mostrarCorreccion }) {
  const acerto = valor === pregunta.correcta
  return (
    <>
      <div className="mt-3 space-y-2">
        {pregunta.opciones.map((op) => {
          const elegida = valor === op.id
          const esCorrecta = op.id === pregunta.correcta
          // Colores: antes de corregir resaltamos la elegida; después,
          // verde para la correcta y rojo si la elegida era incorrecta.
          let clases = 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
          if (mostrarCorreccion && esCorrecta) clases = 'border-emerald-500/70 bg-emerald-500/10'
          else if (mostrarCorreccion && elegida) clases = 'border-red-500/70 bg-red-500/10'
          else if (elegida) clases = 'border-sky-500 bg-sky-500/10'

          return (
            <label key={op.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition ${clases} ${mostrarCorreccion ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={id}
                value={op.id}
                checked={elegida}
                disabled={mostrarCorreccion}
                onChange={() => onCambio(op.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-sky-500"
              />
              <span className="flex-1 text-slate-200">{op.texto}</span>
              {mostrarCorreccion && esCorrecta && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
              {mostrarCorreccion && elegida && !esCorrecta && <XCircle className="h-5 w-5 shrink-0 text-red-400" />}
            </label>
          )
        })}
      </div>
      {mostrarCorreccion && (
        <div className={`mt-3 flex gap-2 rounded-xl p-3 text-sm ${acerto ? 'bg-emerald-500/10 text-emerald-100' : 'bg-amber-500/10 text-amber-100'}`}>
          <Lightbulb className={`mt-0.5 h-4 w-4 shrink-0 ${acerto ? 'text-emerald-300' : 'text-amber-300'}`} />
          <p><strong>{acerto ? '¡Correcto! ' : 'Para repasar: '}</strong>{pregunta.explicacion}</p>
        </div>
      )}
    </>
  )
}

function TextoLibre({ id, pregunta, valor, onCambio }) {
  const largo = valor.trim().length
  const suficiente = largo >= MINIMO_CARACTERES
  return (
    <div className="mt-3">
      <label htmlFor={`${id}-texto`} className="sr-only">{pregunta.enunciado}</label>
      <textarea
        id={`${id}-texto`}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        rows={5}
        placeholder={pregunta.placeholder}
        className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm leading-relaxed text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />
      <p className={`mt-1 text-right text-xs ${suficiente ? 'text-emerald-400' : 'text-slate-500'}`}>
        {suficiente ? '✓ ' : ''}{largo} caracteres{suficiente ? '' : ` (mínimo ${MINIMO_CARACTERES})`}
      </p>
    </div>
  )
}
