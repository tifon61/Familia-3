import { CheckCircle2, Circle, CircleDashed, ChevronRight, Send, Info, MapPin, Users, Lock, RotateCcw } from 'lucide-react'
import { escenarios, preguntaRespondida } from '../data/escenarios'
import { acentos } from '../data/estilos'

// Dashboard: muestra las 4 situaciones con su estado y habilita el envío
// cuando todas están completas.
export default function Panel({ participante, respuestas, completadas, onAbrir, onEnviar, onReiniciar }) {
  const cantidad = escenarios.filter((e) => completadas[e.id]).length
  const todas = cantidad === escenarios.length
  const porcentaje = Math.round((cantidad / escenarios.length) * 100)

  return (
    <main className="animar-entrada mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Panel de situaciones operativas</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-sky-300" />{participante.nombre}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-300" />{participante.localidad}</span>
          </div>
        </div>
        <button onClick={onReiniciar} className="inline-flex items-center gap-1.5 self-start text-xs text-slate-500 transition hover:text-red-300 sm:self-auto">
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar actividad
        </button>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-100">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
        <p className="text-sm sm:text-base">
          Seleccioná y analizá los 4 escenarios meteorológicos. Una vez completados todos, podrás enviar tu reporte.
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Progreso</span>
          <span className="font-semibold text-white">{cantidad} / {escenarios.length} completadas</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {escenarios.map((esc) => (
          <TarjetaSituacion
            key={esc.id}
            escenario={esc}
            respuestas={respuestas[esc.id] ?? {}}
            completada={Boolean(completadas[esc.id])}
            onAbrir={() => onAbrir(esc.id)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <button
          onClick={onEnviar}
          disabled={!todas}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {todas ? <Send className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          Enviar Reporte
        </button>
        <p className="text-xs text-slate-500">
          {todas ? 'Todo listo. Revisá tus respuestas si querés y enviá el reporte.' : `Faltan ${escenarios.length - cantidad} situación(es) para habilitar el envío.`}
        </p>
      </div>
    </main>
  )
}

function TarjetaSituacion({ escenario, respuestas, completada, onAbrir }) {
  const { icono: Icono, numero, titulo, resumen, preguntas } = escenario
  const estilo = acentos[escenario.acento]
  const respondidas = preguntas.filter((p) => preguntaRespondida(p, respuestas[p.id])).length
  const enProgreso = !completada && Object.keys(respuestas).length > 0

  return (
    <button
      onClick={onAbrir}
      className={`group flex h-full flex-col rounded-2xl border bg-slate-900/80 p-5 text-left transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        completada ? 'border-emerald-500/40' : `border-slate-700/70 ${estilo.borde}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${estilo.icono}`}>
          <Icono className="h-6 w-6" />
        </span>
        <Estado completada={completada} enProgreso={enProgreso} />
      </div>
      <p className={`mt-4 text-xs font-semibold uppercase tracking-wider ${estilo.texto}`}>Situación {numero}</p>
      <h3 className="mt-1 text-lg font-bold text-white">{titulo}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-400">{resumen}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-sm">
        <span className="text-slate-500">{respondidas} de {preguntas.length} respuestas</span>
        <span className="inline-flex items-center gap-1 font-medium text-slate-300 group-hover:text-white">
          {completada ? 'Revisar' : 'Analizar'} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}

function Estado({ completada, enProgreso }) {
  if (completada) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" /> Completada
      </span>
    )
  }
  if (enProgreso) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-300">
        <CircleDashed className="h-3.5 w-3.5" /> En curso
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
      <Circle className="h-3.5 w-3.5" /> Pendiente
    </span>
  )
}
