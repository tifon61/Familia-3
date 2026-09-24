import { useState } from 'react'
import { CheckCircle2, XCircle, Copy, Check, Download, Printer, RotateCcw, MapPin, Users, WifiOff, Loader2 } from 'lucide-react'
import { escenarios } from '../data/escenarios'
import { acentos } from '../data/estilos'
import { generarTextoReporte, nombreArchivo } from '../utils/reporte'
import { INSTITUCION } from '../utils/config'

// Pantalla de éxito: resumen de todo lo respondido + copiar / descargar / imprimir.
export default function Reporte({ participante, respuestas, enviadoEn, estadoEnvio, detalleEnvio, enviando, onReintentar, onNuevaActividad }) {
  const [copiado, setCopiado] = useState(false)
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
    <main className="animar-entrada mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* Banner de éxito */}
      <section className="no-imprimir rounded-2xl bg-gradient-to-br from-primario to-primario-oscuro p-6 text-center text-white shadow-[0_8px_28px_rgba(0,63,107,0.3)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/10">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </span>
        <h2 className="mt-4 font-titulo text-2xl font-black uppercase tracking-tight sm:text-4xl">
          {estadoEnvio === 'enviado' ? '¡Reporte enviado con éxito!' : '¡Actividad completada!'}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-white/85">
          {estadoEnvio === 'enviado'
            ? 'Tus respuestas llegaron al equipo del taller. Igual podés guardarte una copia.'
            : 'Completaste las 4 situaciones operativas. Guardá o compartí el reporte para entregarlo al equipo del taller.'}
        </p>
        {estadoEnvio === 'local' && (
          <p className="mx-auto mt-4 max-w-xl rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
            Este reporte no se envió a ninguna planilla (no hay una configurada en la app). Copialo o descargalo para entregarlo.
          </p>
        )}
        {estadoEnvio === 'error' && (
          <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-3 rounded-xl border border-[#fde68a] border-l-4 border-l-[#f59e0b] bg-[#fffbeb] p-4 text-sm font-semibold text-[#78350f] sm:flex-row sm:text-left">
            <WifiOff className="h-5 w-5 shrink-0 text-[#b45309]" />
            <div className="flex-1">
              <p>No se pudo enviar el reporte. Reintentá cuando tengas señal, o copiá / descargá el reporte y mandalo por otro medio.</p>
              {detalleEnvio && <p className="mt-1.5 text-xs font-medium text-[#92400e]">Detalle: {detalleEnvio}</p>}
            </div>
            <button onClick={onReintentar} disabled={enviando} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f59e0b] px-3 py-2 font-extrabold text-white transition hover:brightness-110 disabled:opacity-60">
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />} Reintentar envío
            </button>
          </div>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={copiar} className="inline-flex items-center justify-center gap-2 rounded-lg bg-acento px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0284c7]">
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? '¡Copiado!' : 'Copiar reporte'}
          </button>
          <button onClick={descargar} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-primario transition hover:bg-fondo">
            <Download className="h-4 w-4" /> Descargar .txt
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
        </div>
      </section>

      {/* Resumen visible (y lo único que sale al imprimir) */}
      <article className="solo-reporte mt-6 overflow-hidden rounded-2xl border border-borde bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <header className="border-b-[3px] border-primario p-5 sm:p-8">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-wide text-apagado">{INSTITUCION} · Taller de Información Meteorológica</p>
          <h3 className="mt-1 inline-block border-b-[3px] border-secundario pb-1 font-titulo text-xl font-black text-primario sm:text-2xl">
            Reporte de situaciones operativas
          </h3>
          <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            <Dato Icono={Users} etiqueta="Participante" valor={participante.nombre} />
            <Dato Icono={MapPin} etiqueta="Localidad" valor={participante.localidad} />
          </div>
        </header>

        {escenarios.map((esc) => (
          <section key={esc.id} className="border-b border-borde last:border-0">
            <div className={`flex items-center gap-2 px-5 py-2.5 text-white sm:px-8 ${acentos[esc.acento].cabecera}`}>
              <span className="font-titulo text-sm font-black uppercase">Situación {esc.numero}</span>
              <span className="text-sm font-semibold text-white/85">· {esc.titulo}</span>
            </div>
            <div className="space-y-4 p-5 sm:px-8">
              {esc.preguntas.map((p) => (
                <RespuestaResumen key={p.id} pregunta={p} valor={respuestas[esc.id]?.[p.id]} />
              ))}
            </div>
          </section>
        ))}
      </article>

      <div className="no-imprimir mt-6 text-center">
        <button onClick={onNuevaActividad} className="inline-flex items-center gap-2 text-sm font-semibold text-apagado transition hover:text-primario">
          <RotateCcw className="h-4 w-4" /> Comenzar una nueva actividad
        </button>
      </div>
    </main>
  )
}

function Dato({ Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-celeste-suave px-3 py-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-primario" />
      <div>
        <p className="text-[0.66rem] font-extrabold uppercase tracking-wide text-apagado">{etiqueta}</p>
        <p className="font-bold text-primario">{valor}</p>
      </div>
    </div>
  )
}

function RespuestaResumen({ pregunta, valor }) {
  const encabezado = (
    <p className="text-sm font-semibold text-texto">
      <span className="font-extrabold uppercase text-apagado">{pregunta.etiqueta}:</span> {pregunta.enunciado}
    </p>
  )
  if (pregunta.tipo === 'opcion') {
    const elegida = pregunta.opciones.find((o) => o.id === valor)
    const ok = valor === pregunta.correcta
    return (
      <div>
        {encabezado}
        <p className={`mt-1.5 flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${ok ? 'bg-[#e0f2f1] text-[#004d40]' : 'bg-[#fef2f2] text-[#991b1b]'}`}>
          {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verde" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-peligro" />}
          {elegida?.texto}
        </p>
      </div>
    )
  }
  return (
    <div>
      {encabezado}
      <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-borde bg-fondo px-3 py-2 text-sm text-texto">{valor}</p>
    </div>
  )
}
