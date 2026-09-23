import { useRef } from 'react'
import { CloudSun, ImagePlus } from 'lucide-react'

// Encabezado fijo con el título y el espacio para el logo del grupo.
// El logo se puede cargar haciendo clic: se lee como "data URL" (la imagen
// convertida a texto) y se guarda junto con el resto del estado.
export default function Encabezado({ logo, onCambiarLogo }) {
  const input = useRef(null)

  function alElegirArchivo(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => onCambiarLogo(lector.result)
    lector.readAsDataURL(archivo)
  }

  return (
    <header className="no-imprimir sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-600 bg-slate-900 transition hover:border-sky-400 sm:h-14 sm:w-14"
          title={logo ? 'Cambiar logo' : 'Cargar Logo del Grupo de Pronóstico'}
          aria-label="Logo del Grupo de Pronóstico"
        >
          {logo ? (
            <img src={logo} alt="Logo del Grupo de Pronóstico" className="h-full w-full object-contain p-1" />
          ) : (
            <ImagePlus className="h-5 w-5 text-slate-500 transition group-hover:text-sky-300" />
          )}
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={alElegirArchivo} />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-400">
            <CloudSun className="h-3.5 w-3.5" />
            {logo ? 'Grupo de Pronóstico' : 'Logo del Grupo de Pronóstico'}
          </p>
          <h1 className="truncate text-base font-bold text-white sm:text-xl">
            Taller de Información Meteorológica
            <span className="hidden font-normal text-slate-400 sm:inline"> - Actividad Final</span>
          </h1>
        </div>
      </div>
    </header>
  )
}
