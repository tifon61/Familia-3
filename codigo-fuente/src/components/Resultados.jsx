import { Fragment, useEffect, useMemo, useState } from 'react'
import { BarChart3, Lock, RefreshCw, Users, MapPin, CalendarClock, Search, ChevronDown, FlaskConical, AlertTriangle, Loader2 } from 'lucide-react'
import { BarraHorizontal, ColumnasPuntaje, DistribucionOpciones, Medidor } from './Graficos'
import { calcularEstadisticas, formatoPorcentaje, interpretarFila, preguntasTexto, todasLasPreguntas } from '../utils/analisis'
import { datosDeEjemplo, traerResultados } from '../utils/resultadosApi'
import { GOOGLE_SHEET_URL } from '../utils/config'
import { acentos } from '../data/estilos'

// Página interna de resultados: se abre con index.html#resultados.
// Lee las filas de la Google Sheet (con clave) o muestra datos de ejemplo.

const CLAVE_GUARDADA = 'taller-meteo-clave-resultados'
const leerClave = () => { try { return localStorage.getItem(CLAVE_GUARDADA) ?? '' } catch { return '' } }
const guardarClave = (c) => { try { c ? localStorage.setItem(CLAVE_GUARDADA, c) : localStorage.removeItem(CLAVE_GUARDADA) } catch { /* sin almacenamiento */ } }
const TODAS = '__todas__'

export default function Resultados() {
  const [clave, setClave] = useState(leerClave)
  const [ejemplo, setEjemplo] = useState(!GOOGLE_SHEET_URL)
  const [filas, setFilas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  async function cargar(claveUsada = clave) {
    if (ejemplo) {
      setFilas(datosDeEjemplo())
      return
    }
    setCargando(true)
    setError(null)
    try {
      setFilas(await traerResultados(claveUsada))
      guardarClave(claveUsada)
    } catch (e) {
      setError(e.message)
      if (/clave/i.test(e.message)) { guardarClave(''); setClave('') }
    } finally {
      setCargando(false)
    }
  }

  // Carga automática al entrar (si ya hay clave guardada) o al pasar a ejemplo
  useEffect(() => {
    if (ejemplo || clave) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejemplo])

  const sinDatosTodavia = !filas && !ejemplo
  return (
    <main className="animar-entrada mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-primario px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/70">Página interna</p>
          <h2 className="mt-1 flex items-center gap-2 font-titulo text-2xl font-black uppercase leading-none sm:text-3xl">
            <BarChart3 className="h-7 w-7" /> Resultados
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ejemplo && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase">
              <FlaskConical className="h-3.5 w-3.5" /> Datos de ejemplo
            </span>
          )}
          {GOOGLE_SHEET_URL && (
            <button
              onClick={() => { setFilas(null); setEjemplo(!ejemplo) }}
              className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-bold hover:bg-white/15"
            >
              {ejemplo ? 'Ver datos reales' : 'Ver ejemplo'}
            </button>
          )}
          {filas && !ejemplo && (
            <button onClick={() => cargar()} disabled={cargando} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-primario hover:bg-fondo disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
            </button>
          )}
        </div>
      </div>

      {!GOOGLE_SHEET_URL && (
        <Aviso>
          Todavía no está configurada la Google Sheet (<code>googleSheet</code> en el <code>index.html</code>), así que se muestran
          <strong> datos de ejemplo</strong> inventados para ver cómo queda la página.
        </Aviso>
      )}

      {sinDatosTodavia && (
        <FormularioClave
          cargando={cargando}
          error={error}
          onEnviar={(c) => { setClave(c); cargar(c) }}
          onEjemplo={() => setEjemplo(true)}
        />
      )}

      {filas && <Tablero filas={filas} actualizando={cargando} />}
    </main>
  )
}

function Aviso({ children }) {
  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-[#fde68a] border-l-4 border-l-[#f59e0b] bg-[#fffbeb] px-4 py-3 text-sm text-[#78350f]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
      <p>{children}</p>
    </div>
  )
}

function FormularioClave({ cargando, error, onEnviar, onEjemplo }) {
  const [valor, setValor] = useState('')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valor.trim()) onEnviar(valor.trim()) }}
      className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-borde bg-white shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-2 bg-primario px-6 py-4 text-white">
        <Lock className="h-5 w-5" />
        <h3 className="font-titulo text-lg font-black uppercase">Acceso a resultados</h3>
      </div>
      <div className="p-6">
        <label htmlFor="clave" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-primario">Clave</label>
        <input
          id="clave"
          type="password"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoFocus
          className="w-full rounded-lg border border-borde bg-fondo px-3 py-3 font-semibold focus:border-primario focus:bg-white focus:outline-none focus:ring-2 focus:ring-primario/20"
        />
        <p className="mt-1.5 text-xs text-apagado">Es la <code>CLAVE_RESULTADOS</code> que figura en el script de Google.</p>
        {error && <p className="mt-3 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm font-semibold text-[#991b1b]">{error}</p>}
        <button type="submit" disabled={cargando} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primario px-6 py-3 font-black text-white hover:bg-primario-medio disabled:opacity-60">
          {cargando && <Loader2 className="h-4 w-4 animate-spin" />} Ver resultados
        </button>
        <button type="button" onClick={onEjemplo} className="mt-3 w-full text-sm font-semibold text-apagado hover:text-primario">
          o ver con datos de ejemplo
        </button>
      </div>
    </form>
  )
}

function Tablero({ filas, actualizando }) {
  const participantes = useMemo(() => filas.map(interpretarFila), [filas])
  const [localidad, setLocalidad] = useState(TODAS)
  const listaLocalidades = useMemo(() => [...new Set(participantes.map((p) => p.localidad))].sort(), [participantes])
  // El filtro de localidad afecta a TODO lo que está debajo, para que los
  // números siempre coincidan entre sí.
  const filtrados = useMemo(
    () => (localidad === TODAS ? participantes : participantes.filter((p) => p.localidad === localidad)),
    [participantes, localidad],
  )
  const est = useMemo(() => calcularEstadisticas(filtrados), [filtrados])

  if (participantes.length === 0) {
    return <p className="mt-10 text-center font-semibold text-apagado">Todavía no llegó ningún reporte.</p>
  }

  const totalOpcion = est.porPregunta.length
  return (
    <div className={`mt-5 space-y-5 transition-opacity ${actualizando ? 'opacity-60' : ''}`}>
      {/* Filtro (una sola fila, arriba de todo) */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="filtro-localidad" className="text-xs font-extrabold uppercase tracking-wide text-primario">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Localidad
        </label>
        <select
          id="filtro-localidad"
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          className="rounded-lg border border-borde bg-white px-3 py-2 text-sm font-bold text-texto focus:border-primario focus:outline-none"
        >
          <option value={TODAS}>Todas ({participantes.length})</option>
          {listaLocalidades.map((l) => (
            <option key={l} value={l}>{l} ({participantes.filter((p) => p.localidad === l).length})</option>
          ))}
        </select>
      </div>

      {/* Cifras principales */}
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="rounded-2xl bg-gradient-to-br from-primario to-primario-oscuro p-5 text-white shadow-[0_8px_28px_rgba(0,63,107,0.3)]">
          <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">Aciertos promedio</p>
          <p className="mt-1 text-6xl font-black leading-none">{formatoPorcentaje(est.porcentajePromedio)}</p>
          <p className="mt-2 text-xs font-semibold text-white/75">en las {totalOpcion} preguntas de opción múltiple</p>
        </div>
        <Cifra Icono={Users} etiqueta="Reportes recibidos" valor={est.cantidad} />
        <Cifra Icono={MapPin} etiqueta="Localidades" valor={est.localidades} />
        <Cifra
          Icono={CalendarClock}
          etiqueta="Último envío"
          valor={est.ultimoEnvio ? est.ultimoEnvio.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '—'}
          detalle={est.ultimoEnvio?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Aciertos por situación" subtitulo="Porcentaje de respuestas correctas de opción múltiple en cada situación">
          <div className="space-y-3">
            {est.porSituacion.map((s) => (
              <BarraHorizontal
                key={s.escenario.id}
                etiqueta={`Situación ${s.escenario.numero}`}
                detalle={s.escenario.titulo}
                valor={s.porcentaje}
                texto={formatoPorcentaje(s.porcentaje)}
                titulo={`${s.correctas} de ${s.total} respuestas correctas`}
              />
            ))}
          </div>
        </Tarjeta>
        <Tarjeta titulo="Distribución de puntajes" subtitulo="Cuántas personas sacaron cada cantidad de respuestas correctas">
          <ColumnasPuntaje distribucion={est.distribucion} total={totalOpcion} />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Aciertos por pregunta" subtitulo="Ordenadas de la más difícil a la más fácil">
        <div className="space-y-3">
          {[...est.porPregunta].sort((a, b) => a.porcentaje - b.porcentaje).map((x) => (
            <BarraHorizontal
              key={x.pregunta.clave}
              etiqueta={x.pregunta.corta}
              detalle={x.pregunta.enunciado}
              valor={x.porcentaje}
              texto={formatoPorcentaje(x.porcentaje)}
              titulo={`${x.correctas} de ${est.cantidad} personas respondieron bien`}
            />
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Qué respondieron" subtitulo="Opción elegida en cada pregunta. En verde, la respuesta correcta.">
        <div className="grid gap-4 md:grid-cols-2">
          {est.porPregunta.map((x) => <DistribucionOpciones key={x.pregunta.clave} datos={x} cantidad={est.cantidad} />)}
        </div>
      </Tarjeta>

      {localidad === TODAS && (
        <Tarjeta titulo="Por localidad">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-borde text-left text-[0.7rem] font-extrabold uppercase tracking-wide text-apagado">
                  <th className="py-2 pr-4">Localidad</th>
                  <th className="py-2 pr-4 text-right">Reportes</th>
                  <th className="py-2">Aciertos promedio</th>
                </tr>
              </thead>
              <tbody>
                {est.porLocalidad.map((l) => (
                  <tr key={l.localidad} className="border-b border-borde last:border-0 hover:bg-fondo">
                    <td className="py-2 pr-4 font-bold text-texto">{l.localidad}</td>
                    <td className="py-2 pr-4 text-right font-bold tabular-nums">{l.cantidad}</td>
                    <td className="py-2"><Medidor valor={l.porcentaje} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}

      <TablaParticipantes participantes={filtrados} />
      <RespuestasAbiertas participantes={filtrados} />
    </div>
  )
}

function Cifra({ Icono, etiqueta, valor, detalle }) {
  return (
    <div className="rounded-2xl border border-borde bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-apagado">
        <Icono className="h-3.5 w-3.5" /> {etiqueta}
      </p>
      <p className="mt-2 text-3xl font-black text-primario">{valor}</p>
      {detalle && <p className="text-xs font-semibold text-apagado">{detalle} hs</p>}
    </div>
  )
}

function Tarjeta({ titulo, subtitulo, children }) {
  return (
    <section className="rounded-2xl border border-borde bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6">
      <h3 className="inline-block border-b-[3px] border-secundario pb-1 font-titulo text-lg font-black text-primario">{titulo}</h3>
      {subtitulo && <p className="mt-2 text-sm text-apagado">{subtitulo}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function TablaParticipantes({ participantes }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(null)
  const q = busqueda.trim().toLowerCase()
  const lista = participantes
    .filter((p) => !q || p.nombre.toLowerCase().includes(q) || p.localidad.toLowerCase().includes(q))
    .sort((a, b) => (b.fecha ?? 0) - (a.fecha ?? 0))

  return (
    <Tarjeta titulo="Participantes" subtitulo="Tocá una fila para ver todas sus respuestas">
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apagado" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o localidad"
          className="w-full rounded-lg border border-borde bg-fondo py-2 pl-9 pr-3 text-sm focus:border-primario focus:bg-white focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-borde text-left text-[0.7rem] font-extrabold uppercase tracking-wide text-apagado">
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Localidad</th>
              <th className="py-2 pr-3">Fecha</th>
              <th className="py-2 pr-3 text-right">Correctas</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <Fragment key={p.id}>
                <tr
                  onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                  className="cursor-pointer border-b border-borde hover:bg-fondo"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setAbierto(abierto === p.id ? null : p.id))}
                  aria-expanded={abierto === p.id}
                >
                  <td className="py-2.5 pr-3 font-bold text-texto">{p.nombre}</td>
                  <td className="py-2.5 pr-3 text-apagado">{p.localidad}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums text-apagado">
                    {p.fecha ? p.fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-extrabold tabular-nums text-texto">{p.correctas}/{p.total}</td>
                  <td><ChevronDown className={`h-4 w-4 text-apagado transition ${abierto === p.id ? 'rotate-180' : ''}`} /></td>
                </tr>
                {abierto === p.id && (
                  <tr className="border-b border-borde bg-fondo">
                    <td colSpan={5} className="p-4">
                      <DetalleParticipante participante={p} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <p className="py-6 text-center text-sm text-apagado">No hay coincidencias.</p>}
      </div>
    </Tarjeta>
  )
}

function DetalleParticipante({ participante }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {todasLasPreguntas.map((p) => {
        const r = participante.respuestas[p.clave]
        const esOpcion = p.tipo === 'opcion'
        return (
          <div key={p.clave} className="rounded-lg border border-borde bg-white p-3">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-wide text-apagado">{p.corta}</p>
            <p className="mt-0.5 text-xs font-semibold text-apagado">{p.enunciado}</p>
            <p className={`mt-1.5 whitespace-pre-wrap text-sm ${esOpcion ? 'font-bold' : ''} ${esOpcion ? (r?.correcta ? 'text-verde' : 'text-[#991b1b]') : 'text-texto'}`}>
              {esOpcion && (r?.correcta ? '✓ ' : '✗ ')}
              {r?.texto || '(sin respuesta)'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function RespuestasAbiertas({ participantes }) {
  const [clave, setClave] = useState(preguntasTexto[0]?.clave)
  const pregunta = preguntasTexto.find((p) => p.clave === clave)
  const respuestas = participantes
    .map((p) => ({ p, texto: p.respuestas[clave]?.texto?.trim() }))
    .filter((x) => x.texto)
  return (
    <Tarjeta titulo="Respuestas de texto libre" subtitulo="Para leer todas las respuestas a una misma pregunta">
      <div className="flex flex-wrap gap-2">
        {preguntasTexto.map((p) => (
          <button
            key={p.clave}
            onClick={() => setClave(p.clave)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              p.clave === clave ? 'bg-primario text-white' : 'bg-fondo text-apagado hover:text-primario'
            }`}
          >
            {p.corta}
          </button>
        ))}
      </div>
      {pregunta && (
        <>
          <div className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-bold text-white ${acentos[pregunta.escenario.acento].cabecera}`}>
            {pregunta.enunciado}
          </div>
          <ul className="mt-3 divide-y divide-borde">
            {respuestas.map(({ p, texto }) => (
              <li key={p.id} className="py-3">
                <p className="whitespace-pre-wrap text-sm text-texto">{texto}</p>
                <p className="mt-1 text-xs font-bold text-apagado">— {p.nombre} · {p.localidad}</p>
              </li>
            ))}
          </ul>
          {respuestas.length === 0 && <p className="py-6 text-center text-sm text-apagado">Sin respuestas todavía.</p>}
        </>
      )}
    </Tarjeta>
  )
}
