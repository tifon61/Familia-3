import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, XCircle, Save, ClipboardList, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react'
import VisualEscenario from './Visuales'
import { MINIMO_CARACTERES, escenarioCompleto, preguntaRespondida } from '../data/escenarios'
import { acentos } from '../data/estilos'
import { imagenes } from '../utils/config'

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
    <div className="fixed inset-0 z-40 flex items-stretch justify-center bg-primario-oscuro/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        ref={contenedor}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-escenario"
        onClick={(e) => e.stopPropagation()}
        className="animar-entrada relative w-full max-w-6xl overflow-y-auto bg-fondo outline-none sm:max-h-[92vh] sm:rounded-2xl sm:shadow-2xl"
      >
        {/* Cabecera del modal, del color de la situación */}
        <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 text-white sm:px-6 ${estilo.cabecera}`}>
          <Icono className="h-9 w-9 shrink-0 opacity-90" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-wide text-white/75">Situación {escenario.numero}</p>
            <h2 id="titulo-escenario" className="truncate font-titulo text-lg font-black uppercase leading-tight tracking-tight sm:text-2xl">{escenario.titulo}</h2>
          </div>
          <button onClick={onCerrar} className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>
        </div>

        {completada && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-[#b2dfdb] border-l-4 border-l-verde bg-[#e0f2f1] px-4 py-3 text-sm font-semibold text-verde sm:mx-6">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Situación completada. Abajo vas a ver la corrección de las preguntas de opción múltiple. Podés seguir editando tus respuestas de texto.
          </div>
        )}

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Columna izquierda: contexto meteorológico y recursos visuales */}
          <section className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-borde bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primario">
                <ClipboardList className="h-4 w-4" /> Contexto meteorológico
              </h3>
              <div className="mt-3 space-y-3 text-[0.92rem] leading-relaxed text-texto">
                {escenario.contexto.map((parrafo, i) => <p key={i}>{parrafo}</p>)}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-celeste-suave p-2">
                {escenario.datos.map((d) => (
                  <div key={d.etiqueta} className={`rounded-lg px-3 py-2 ${d.destacado ? 'bg-[#fffbeb] ring-1 ring-[#fde68a]' : 'bg-white/60'}`}>
                    <dt className="text-[0.66rem] font-extrabold uppercase tracking-wide text-apagado">{d.etiqueta}</dt>
                    <dd className={`text-base font-extrabold ${d.destacado ? 'text-[#b45309]' : 'text-primario'}`}>{d.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ImagenOpcional key={escenario.id} src={imagenes.situacion(escenario.numero)} alt={`Imagen de referencia: ${escenario.titulo}`} />
            <VisualEscenario tipo={escenario.visual} />
          </section>

          {/* Columna derecha: formulario */}
          <section className="space-y-4">
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

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button onClick={onCerrar} className="inline-flex items-center justify-center gap-2 rounded-full border border-borde bg-white px-6 py-3 text-sm font-bold text-primario transition hover:bg-fondo">
                <ArrowLeft className="h-4 w-4" /> Volver al panel
              </button>
              {!completada && (
                <button onClick={completar} className="inline-flex items-center justify-center gap-2 rounded-full bg-primario px-6 py-3 text-sm font-black text-white shadow-[0_6px_18px_rgba(0,63,107,0.3)] transition hover:-translate-y-0.5 hover:bg-primario-medio">
                  <Save className="h-4 w-4" /> Guardar y marcar como completada
                </button>
              )}
            </div>
            {!completada && (
              <p className="text-right text-xs font-semibold text-apagado">Tus respuestas se guardan automáticamente mientras escribís.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// Muestra una imagen real (satélite, carta sinóptica, foto) solo si el archivo
// existe. Si no existe, onError la oculta y no queda un ícono de imagen rota.
function ImagenOpcional({ src, alt }) {
  const [existe, setExiste] = useState(true)
  if (!existe) return null
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-borde bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" title="Abrir imagen en tamaño completo">
      <img src={src} alt={alt} loading="lazy" onError={() => setExiste(false)} className="block h-auto w-full" />
    </a>
  )
}

function Pregunta({ id, pregunta, valor, onCambio, mostrarCorreccion, mostrarError }) {
  const esDecision = pregunta.etiqueta === 'Decisión operativa'
  // Decisión operativa: estilo "banner de aviso" ámbar, como en la página
  // del grupo. El resto: tarjeta blanca.
  const marco = mostrarError
    ? 'border-[#fecaca] border-l-4 border-l-peligro bg-[#fef2f2]'
    : esDecision
      ? 'border-[#fde68a] border-l-4 border-l-[#f59e0b] bg-[#fffbeb]'
      : 'border-borde bg-white'

  return (
    <fieldset id={id} className={`rounded-2xl border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-5 ${marco}`}>
      <legend className="sr-only">{pregunta.etiqueta}</legend>
      <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide ${esDecision ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-fondo text-apagado'}`}>
        {esDecision && <AlertTriangle className="h-3.5 w-3.5" />}
        {pregunta.etiqueta} · {pregunta.tipo === 'opcion' ? 'Opción múltiple' : 'Texto libre'}
      </p>
      <p className="mt-3 text-[0.98rem] font-bold leading-snug text-texto">{pregunta.enunciado}</p>

      {pregunta.tipo === 'opcion' ? (
        <OpcionMultiple id={id} pregunta={pregunta} valor={valor} onCambio={onCambio} mostrarCorreccion={mostrarCorreccion} />
      ) : (
        <TextoLibre id={id} pregunta={pregunta} valor={valor ?? ''} onCambio={onCambio} />
      )}

      {mostrarError && (
        <p className="mt-2 text-xs font-bold text-peligro">
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
          let clases = 'border-borde bg-white hover:border-secundario hover:bg-fondo'
          if (mostrarCorreccion && esCorrecta) clases = 'border-verde bg-[#e0f2f1]'
          else if (mostrarCorreccion && elegida) clases = 'border-peligro bg-[#fef2f2]'
          else if (mostrarCorreccion) clases = 'border-borde bg-white opacity-70'
          else if (elegida) clases = 'border-primario bg-celeste-suave'

          return (
            <label key={op.id} className={`flex items-start gap-3 rounded-xl border-2 p-3 text-sm transition ${clases} ${mostrarCorreccion ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={id}
                value={op.id}
                checked={elegida}
                disabled={mostrarCorreccion}
                onChange={() => onCambio(op.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primario"
              />
              <span className={`flex-1 ${elegida ? 'font-bold text-primario' : 'font-medium text-texto'}`}>{op.texto}</span>
              {mostrarCorreccion && esCorrecta && <CheckCircle2 className="h-5 w-5 shrink-0 text-verde" />}
              {mostrarCorreccion && elegida && !esCorrecta && <XCircle className="h-5 w-5 shrink-0 text-peligro" />}
            </label>
          )
        })}
      </div>
      {mostrarCorreccion && (
        <div className={`mt-3 flex gap-2 rounded-xl p-3 text-sm leading-relaxed ${acerto ? 'bg-[#e0f2f1] text-[#004d40]' : 'bg-[#fffbeb] text-[#78350f]'}`}>
          <Lightbulb className={`mt-0.5 h-4 w-4 shrink-0 ${acerto ? 'text-verde' : 'text-[#b45309]'}`} />
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
        className="w-full resize-y rounded-lg border border-[#cbd5e1] bg-white p-3 text-[0.95rem] leading-relaxed text-texto placeholder:text-apagado/70 focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
      />
      <p className={`mt-1 text-right text-xs font-bold ${suficiente ? 'text-verde' : 'text-apagado'}`}>
        {suficiente ? '✓ ' : ''}{largo} caracteres{suficiente ? '' : ` (mínimo ${MINIMO_CARACTERES})`}
      </p>
    </div>
  )
}
