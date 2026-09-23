import { useState } from 'react'
import { CheckCircle2, XCircle, Copy, Check, Download, Printer, RotateCcw, Award, MapPin, Users, CalendarClock, WifiOff, Loader2 } from 'lucide-react'
import { escenarios } from '../data/escenarios'
import { acentos } from '../data/estilos'
import { calcularPuntaje, formatearFecha, generarTextoReporte, nombreArchivo } from '../utils/reporte'

// Pantalla de éxito: resumen de todo lo respondido + copiar / descargar / imprimir.
export default function Reporte({ participante, respuestas, enviadoEn, estadoEnvio, enviando, onReintentar, onNuevaActividad }) {
  const [copiado, setCopiado] = useState(false)
  const { correctas, total } = calcularPuntaje(respuestas)
  const texto = generarTextoReporte({ participante, respuestas, enviadoEn })

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Plan B para navegadores sin API de portapapeles (o sin HTTPS)
      const area = document.createElement('textarea')
      area.value = texto
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  function descargar() {
    // Creamos un archivo en memoria (Blob), le damos una URL temporal y
    // simulamos un clic en un enlace de descarga.
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo(participante)
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="animar-entrada mx-auto max-w-4xl px-4 py-8">
      <section className="no-imprimir rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-slate-900 p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/20">
          <CheckCircle2 className="h-9 w-9 text-emerald-300" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
          {estadoEnvio === 'enviado' ? '¡Reporte enviado con éxito!' : '¡Actividad completada!'}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-300">
          {estadoEnvio === 'enviado'
            ? 'Tus respuestas llegaron al equipo del taller. Igual podés guardarte una copia.'
            : 'Completaste las 4 situaciones operativas. Guardá o compartí el reporte para entregarlo al equipo del taller.'}
        </p>
        {estadoEnvio === 'error' && (
          <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100 sm:flex-row sm:text-left">
            <WifiOff className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="flex-1">No se pudo enviar por internet. Reintentá cuando tengas señal, o copiá / descargá el reporte y mandalo por otro medio.</p>
            <button onClick={onReintentar} disabled={enviando} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />} Reintentar envío
            </button>
          </div>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={copiar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500">
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? '¡Copiado!' : 'Copiar reporte'}
          </button>
          <button onClick={descargar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
            <Download className="h-4 w-4" /> Descargar .txt
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
        </div>
      </section>

      {/* Resumen visible (y lo único que sale al imprimir) */}
      <article className="solo-reporte mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8">
        <header className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">Taller de Información Meteorológica - Actividad Final</p>
          <h3 className="mt-1 text-xl font-bold text-white">Reporte de situaciones operativas</h3>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Dato Icono={Users} etiqueta="Brigadista / participantes" valor={participante.nombre} />
            <Dato Icono={MapPin} etiqueta="Localidad / base operativa" valor={participante.localidad} />
            <Dato Icono={CalendarClock} etiqueta="Fecha de envío" valor={formatearFecha(enviadoEn)} />
            <Dato Icono={Award} etiqueta="Opción múltiple" valor={`${correctas} de ${total} correctas`} />
          </div>
        </header>

        {escenarios.map((esc) => (
          <section key={esc.id} className="border-b border-slate-800 py-6 last:border-0 last:pb-0">
            <p className={`text-xs font-semibold uppercase tracking-wider ${acentos[esc.acento].texto}`}>Situación {esc.numero}</p>
            <h4 className="text-lg font-bold text-white">{esc.titulo}</h4>
            <div className="mt-4 space-y-4">
              {esc.preguntas.map((p) => (
                <RespuestaResumen key={p.id} pregunta={p} valor={respuestas[esc.id]?.[p.id]} />
              ))}
            </div>
          </section>
        ))}
      </article>

      <div className="no-imprimir mt-8 text-center">
        <button onClick={onNuevaActividad} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <RotateCcw className="h-4 w-4" /> Comenzar una nueva actividad
        </button>
      </div>
    </main>
  )
}

function Dato({ Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div>
        <p className="text-xs text-slate-500">{etiqueta}</p>
        <p className="font-medium text-slate-100">{valor}</p>
      </div>
    </div>
  )
}

function RespuestaResumen({ pregunta, valor }) {
  if (pregunta.tipo === 'opcion') {
    const elegida = pregunta.opciones.find((o) => o.id === valor)
    const ok = valor === pregunta.correcta
    return (
      <div>
        <p className="text-sm font-medium text-slate-300"><span className="text-slate-500">{pregunta.etiqueta}:</span> {pregunta.enunciado}</p>
        <p className={`mt-1 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${ok ? 'bg-emerald-500/10 text-emerald-100' : 'bg-red-500/10 text-red-100'}`}>
          {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
          {elegida?.texto}
        </p>
      </div>
    )
  }
  return (
    <div>
      <p className="text-sm font-medium text-slate-300"><span className="text-slate-500">{pregunta.etiqueta}:</span> {pregunta.enunciado}</p>
      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-100">{valor}</p>
    </div>
  )
}
