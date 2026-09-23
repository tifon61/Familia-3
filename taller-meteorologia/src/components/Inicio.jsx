import { useState } from 'react'
import { ArrowRight, MapPin, Users, ShieldAlert, Thermometer, Wind, ChevronDown } from 'lucide-react'
import { localidades, OTRA } from '../data/localidades'
import { imagenes, INSTITUCION } from '../utils/config'

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
    <main className="animar-entrada">
      {/* Franja de bienvenida. Capas del fondo (de arriba hacia abajo):
          velo oscuro, foto opcional imagenes/fondo.jpg y degradé azul.
          Si la foto no existe, se ve solo el degradé. */}
      <section
        className="bg-cover bg-center px-4 pb-28 pt-12 text-center sm:pb-32 sm:pt-16"
        style={{
          backgroundImage: `linear-gradient(rgba(0,20,40,0.45), rgba(0,20,40,0.45)), url("${imagenes.fondo}"), linear-gradient(135deg, #003f6b, #001f35)`,
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secundario-claro">Brigadistas forestales</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-titulo text-3xl font-black uppercase leading-none tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.4)] sm:text-5xl">
          Taller de Información Meteorológica
        </h2>
        <p className="mt-3 text-base font-semibold text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)] sm:text-lg">
          Actividad Final · {INSTITUCION}
        </p>
      </section>

      <div className="mx-auto -mt-20 grid max-w-5xl gap-6 px-4 pb-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Presentación */}
        <section className="order-2 rounded-2xl border border-borde bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:order-1 sm:p-8">
          <h3 className="inline-block border-b-[3px] border-secundario pb-2 font-titulo text-xl font-black text-primario">
            ¿De qué se trata?
          </h3>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-apagado">
            Vas a analizar <strong className="text-texto">4 escenarios meteorológicos</strong> de trabajo en incendios
            forestales y tomar decisiones operativas en cada uno. Al terminar, se genera un reporte para entregar.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              { Icono: Wind, texto: 'Frentes y cambios de viento' },
              { Icono: Thermometer, texto: 'Estabilidad atmosférica' },
              { Icono: ShieldAlert, texto: 'Seguridad de las cuadrillas' },
            ].map(({ Icono, texto }) => (
              <li key={texto} className="flex items-center gap-3 rounded-xl bg-celeste-suave px-4 py-3 text-sm font-bold text-primario">
                <Icono className="h-5 w-5 shrink-0" /> {texto}
              </li>
            ))}
          </ul>
        </section>

        {/* Formulario */}
        <form onSubmit={enviar} noValidate className="order-1 overflow-hidden rounded-2xl border border-borde bg-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] lg:order-2">
          <div className="bg-primario px-6 py-4 text-white sm:px-8">
            <h3 className="font-titulo text-xl font-black uppercase tracking-tight">Datos del equipo</h3>
            <p className="text-xs font-semibold text-white/70">Ambos campos son obligatorios para comenzar</p>
          </div>
          <div className="p-6 sm:p-8">
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
              <label htmlFor="localidad" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-primario">
                Localidad / Base operativa <span className="text-peligro">*</span>
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apagado" />
                <select
                  id="localidad"
                  value={seleccion}
                  onChange={(e) => setSeleccion(e.target.value)}
                  aria-invalid={intentado && errorLocalidad}
                  className={`w-full appearance-none rounded-lg border bg-fondo py-3 pl-10 pr-10 font-bold focus:outline-none focus:ring-2 ${seleccion ? 'text-texto' : 'text-apagado'} ${
                    intentado && errorLocalidad && seleccion !== OTRA ? 'border-peligro focus:ring-peligro/30' : 'border-borde focus:border-primario focus:ring-primario/20'
                  }`}
                >
                  <option value="">Seleccioná tu localidad…</option>
                  {localidades.map((l) => <option key={l} value={l}>{l}</option>)}
                  <option value={OTRA}>Otra (escribirla)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apagado" />
              </div>
              {intentado && errorLocalidad && seleccion !== OTRA && (
                <p className="mt-1.5 text-xs font-semibold text-peligro">Elegí la localidad o base operativa.</p>
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
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primario px-8 py-4 text-[1.05rem] font-black text-white shadow-[0_6px_18px_rgba(0,63,107,0.35)] transition hover:-translate-y-0.5 hover:bg-primario-medio focus:outline-none focus-visible:ring-4 focus-visible:ring-secundario/50"
            >
              Comenzar Actividad <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function Campo({ id, etiqueta, Icono, valor, onCambio, placeholder, error }) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-primario">
        {etiqueta} <span className="text-peligro">*</span>
      </label>
      <div className="relative">
        <Icono className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apagado" />
        <input
          id={id}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-lg border bg-fondo py-3 pl-10 pr-3 font-semibold text-texto placeholder:font-normal placeholder:text-apagado/70 focus:bg-white focus:outline-none focus:ring-2 ${
            error ? 'border-peligro focus:ring-peligro/30' : 'border-borde focus:border-primario focus:ring-primario/20'
          }`}
        />
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-peligro">{error}</p>}
    </div>
  )
}
