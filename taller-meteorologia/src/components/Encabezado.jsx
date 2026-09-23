import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { imagenes, INSTITUCION } from '../utils/config'

// Encabezado blanco con la línea azul inferior, igual que la página del Grupo
// de Pronóstico.
// - Logo del grupo: si existe imagenes/logo.png se usa ese; si no, se puede
//   cargar haciendo clic (se lee como "data URL" y se guarda con el estado).
// - Logo de la institución (imagenes/logo-institucion.png): opcional, solo
//   aparece si el archivo existe.
export default function Encabezado({ logo: logoCargado, onCambiarLogo }) {
  const input = useRef(null)
  const [sinLogoFijo, setSinLogoFijo] = useState(false)
  const [sinLogoInstitucion, setSinLogoInstitucion] = useState(false)
  // Prioridad: el que cargó la persona > el archivo fijo > ninguno
  const logo = logoCargado ?? (sinLogoFijo ? null : imagenes.logo)

  function alElegirArchivo(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => onCambiarLogo(lector.result)
    lector.readAsDataURL(archivo)
  }

  return (
    <header className="no-imprimir sticky top-0 z-30 border-b-[3px] border-primario bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex min-h-[66px] max-w-6xl items-center gap-3 px-4 py-2 sm:gap-4 sm:px-8">
        {!sinLogoInstitucion && (
          <img
            src={imagenes.logoInstitucion}
            alt="Institución"
            className="hidden h-[42px] object-contain sm:block"
            onError={() => setSinLogoInstitucion(true)}
          />
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-borde bg-fondo transition hover:border-primario data-[logo=si]:border-0 data-[logo=si]:bg-transparent"
          data-logo={logo ? 'si' : 'no'}
          title={logo ? 'Cambiar logo' : 'Cargar Logo del Grupo de Pronóstico'}
          aria-label="Logo del Grupo de Pronóstico"
        >
          {logo ? (
            <img
              src={logo}
              alt="Logo del Grupo de Pronóstico"
              className="h-full w-full rounded-full object-cover"
              onError={() => setSinLogoFijo(true)} // el archivo no existe
            />
          ) : (
            <ImagePlus className="h-4 w-4 text-apagado transition group-hover:text-primario" />
          )}
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={alElegirArchivo} />

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-titulo text-sm font-black uppercase leading-tight tracking-tight text-primario sm:text-[1.1rem]">
            Taller de Información Meteorológica
          </h1>
          <p className="truncate text-[11px] font-semibold text-apagado sm:text-xs">{INSTITUCION}</p>
        </div>

        <span className="hidden shrink-0 rounded-lg bg-primario px-4 py-2 text-[0.8rem] font-bold uppercase tracking-wide text-white md:inline-block">
          Actividad Final
        </span>
      </div>
    </header>
  )
}
