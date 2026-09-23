import { useState } from 'react'
import { ArrowRight, MapPin, Users, ShieldAlert, Flame, Thermometer, Wind, ChevronDown } from 'lucide-react'
import { localidades, OTRA } from '../data/localidades'

// Pantalla de inicio: pide los datos obligatorios antes de habilitar el panel.
export default function Inicio({ datosIniciales, onComenzar }) {
  const [nombre, setNombre] = useState(datosIniciales?.nombre ?? '')
  // Si la localidad guardada no está en la lista, es porque eligieron "Otra"
  const inicial = datosIniciales?.localidad ?? ''
  const enLista = inicial === '' || localidades.includes(inicial)
  const [seleccion, setSeleccion] = useState(enLista ? inicial : OTRA)
  const [otra, setOtra] = useState(enLista ? '' : inicial)
  const [intentado, setIntentado] = useState(false)

  const localidad = seleccion === OTRA ? otra.trim() : seleccion
  const errorNombre = nombre.trim().length < 3
  const errorLocalidad = localidad.length < 2

  function enviar(e) {
    e.preventDefault() // evita que el navegador recargue la página
    setIntentado(true)
    if (errorNombre || errorLocalidad) return
    onComenzar({ nombre: nombre.trim(), localidad })
  }

  return (
    <main className="animar-entrada mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-16">
      <section>
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
          <Flame className="h-3.5 w-3.5" /> Brigadistas forestales
        </span>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          Taller de Información Meteorológica
          <span className="block bg-gradient-to-r from-sky-300 to-orange-300 bg-clip-text text-transparent">Actividad Final</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-300">
          Vas a analizar 4 escenarios meteorológicos reales de trabajo en incendios forestales y
          tomar decisiones operativas en cada uno. Al terminar, se genera un reporte para entregar.
        </p>
        <ul className="mt-6 grid max-w-xl gap-3 text-sm text-slate-300 sm:grid-cols-3">
          {[
            { Icono: Wind, texto: 'Frentes y vientos' },
            { Icono: Thermometer, texto: 'Estabilidad' },
            { Icono: ShieldAlert, texto: 'Seguridad en línea' },
          ].map(({ Icono, texto }) => (
            <li key={texto} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
              <Icono className="h-4 w-4 text-sky-300" /> {texto}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={enviar} noValidate className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Datos del equipo</h3>
        <p className="mt-1 text-sm text-slate-400">Ambos campos son obligatorios para comenzar.</p>

        <Campo
          id="nombre"
          etiqueta="Nombre del brigadista / participantes"
          Icono={Users}
          valor={nombre}
          onCambio={setNombre}
          placeholder="Ej.: Ana Pérez, Juan Gómez"
          error={intentado && errorNombre ? 'Ingresá al menos un nombre (mínimo 3 letras).' : null}
        />
        <div className="mt-5">
          <label htmlFor="localidad" className="mb-1.5 block text-sm font-medium text-slate-200">
            Localidad / Base operativa <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              id="localidad"
              value={seleccion}
              onChange={(e) => setSeleccion(e.target.value)}
              aria-invalid={intentado && errorLocalidad}
              className={`w-full appearance-none rounded-xl border bg-slate-950 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 ${seleccion ? 'text-white' : 'text-slate-500'} ${
                intentado && errorLocalidad && seleccion !== OTRA ? 'border-red-500/70 focus:ring-red-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/40'
              }`}
            >
              <option value="">Seleccioná tu localidad…</option>
              {localidades.map((l) => <option key={l} value={l}>{l}</option>)}
              <option value={OTRA}>Otra (escribirla)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          {intentado && errorLocalidad && seleccion !== OTRA && (
            <p className="mt-1.5 text-xs text-red-400">Elegí la localidad o base operativa.</p>
          )}
        </div>
        {seleccion === OTRA && (
          <Campo
            id="localidad-otra"
            etiqueta="¿Cuál?"
            Icono={MapPin}
            valor={otra}
            onCambio={setOtra}
            placeholder="Escribí tu localidad o base"
            error={intentado && errorLocalidad ? 'Escribí el nombre de la localidad.' : null}
          />
        )}

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          Comenzar Actividad <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </main>
  )
}

function Campo({ id, etiqueta, Icono, valor, onCambio, placeholder, error }) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {etiqueta} <span className="text-orange-400">*</span>
      </label>
      <div className="relative">
        <Icono className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-slate-950 py-3 pl-10 pr-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 ${
            error ? 'border-red-500/70 focus:ring-red-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/40'
          }`}
        />
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
