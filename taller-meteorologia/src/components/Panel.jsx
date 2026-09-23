import { CheckCircle2, Circle, CircleDashed, ChevronRight, Send, Info, MapPin, Lock, RotateCcw, Loader2 } from 'lucide-react'
import { escenarios, preguntaRespondida } from '../data/escenarios'
import { acentos } from '../data/estilos'

// Dashboard: muestra las 4 situaciones con su estado y habilita el envío
// cuando todas están completas.
export default function Panel({ participante, respuestas, completadas, enviando, onAbrir, onEnviar, onReiniciar }) {
  const cantidad = escenarios.filter((e) => completadas[e.id]).length
  const todas = cantidad === escenarios.length
  const porcentaje = Math.round((cantidad / escenarios.length) * 100)

  return (
    <main className="animar-entrada mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Barra del participante (estilo "barra de ciudad") */}
      <div className="flex flex-col gap-4 rounded-2xl bg-primario px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/70">Panel de situaciones operativas</p>
          <h2 className="mt-1 truncate font-titulo text-2xl font-black uppercase leading-none sm:text-3xl">{participante.nombre}</h2>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
            <MapPin className="h-3.5 w-3.5" /> {participante.localidad}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-center text-[0.7rem] font-extrabold uppercase tracking-wide">
            Progreso
            <span className="block text-lg font-black leading-tight">{cantidad} / {escenarios.length}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-borde" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de la actividad">
        <div className="h-full rounded-full bg-verde transition-all duration-500" style={{ width: `${porcentaje}%` }} />
      </div>

      <div className="mt-5 flex gap-3 rounded-xl border border-secundario-claro border-l-4 border-l-secundario bg-white px-4 py-3.5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primario" />
        <p className="text-sm font-semibold text-texto sm:text-[0.95rem]">
          Seleccioná y analizá los 4 escenarios meteorológicos. Una vez completados todos, podrás enviar tu reporte.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {escenarios.map((esc, i) => (
          <TarjetaSituacion
            key={esc.id}
            escenario={esc}
            orden={i}
            respuestas={respuestas[esc.id] ?? {}}
            completada={Boolean(completadas[esc.id])}
            onAbrir={() => onAbrir(esc.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-borde bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={onEnviar}
          disabled={!todas || enviando}
          className="inline-flex items-center gap-2 rounded-full bg-verde px-8 py-3.5 text-base font-black text-white shadow-[0_6px_18px_rgba(0,121,107,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-borde disabled:text-apagado disabled:shadow-none"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : todas ? <Send className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          {enviando ? 'Enviando…' : 'Enviar Reporte'}
        </button>
        <p className="text-xs font-semibold text-apagado">
          {todas ? 'Todo listo. Revisá tus respuestas si querés y enviá el reporte.' : `Faltan ${escenarios.length - cantidad} situación(es) para habilitar el envío.`}
        </p>
      </div>

      <div className="mt-4 text-center">
        <button onClick={onReiniciar} className="inline-flex items-center gap-1.5 text-xs font-semibold text-apagado transition hover:text-peligro">
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar actividad
        </button>
      </div>
    </main>
  )
}

function TarjetaSituacion({ escenario, orden, respuestas, completada, onAbrir }) {
  const { icono: Icono, numero, titulo, resumen, preguntas } = escenario
  const estilo = acentos[escenario.acento]
  const respondidas = preguntas.filter((p) => preguntaRespondida(p, respuestas[p.id])).length
  const enProgreso = !completada && Object.keys(respuestas).length > 0

  return (
    <button
      onClick={onAbrir}
      style={{ animationDelay: `${orden * 0.08}s` }}
      className={`animar-entrada group flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-[3px] hover:shadow-[0_10px_26px_rgba(0,0,0,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-secundario/50 ${
        completada ? 'border-verde' : `border-transparent ${estilo.borde}`
      }`}
    >
      <div className={`flex items-center justify-between gap-3 px-5 py-3.5 text-white ${estilo.cabecera}`}>
        <div>
          <p className="font-titulo text-2xl font-black uppercase leading-none tracking-tight">Situación {numero}</p>
          <p className="mt-1 text-xs font-semibold text-white/75">{preguntas.length} preguntas</p>
        </div>
        <Icono className="flotar h-10 w-10 shrink-0 opacity-90" strokeWidth={1.75} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold leading-snug text-texto">{titulo}</h3>
          <Estado completada={completada} enProgreso={enProgreso} />
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-apagado">{resumen}</p>
        <div className="mt-4 flex items-center justify-between border-t border-borde pt-3 text-sm">
          <span className="font-semibold text-apagado">{respondidas} de {preguntas.length} respuestas</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-fondo px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primario transition group-hover:bg-primario group-hover:text-white">
            {completada ? 'Revisar' : 'Analizar'} <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  )
}

function Estado({ completada, enProgreso }) {
  if (completada) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#e0f2f1] px-2.5 py-1 text-xs font-extrabold text-verde">
        <CheckCircle2 className="h-3.5 w-3.5" /> Completada
      </span>
    )
  }
  if (enProgreso) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#e0f2fe] px-2.5 py-1 text-xs font-extrabold text-[#0369a1]">
        <CircleDashed className="h-3.5 w-3.5" /> En curso
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#fef9c3] px-2.5 py-1 text-xs font-extrabold text-[#854d0e]">
      <Circle className="h-3.5 w-3.5" /> Pendiente
    </span>
  )
}
