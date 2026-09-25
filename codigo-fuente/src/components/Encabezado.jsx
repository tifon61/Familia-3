import { INSTITUCION } from '../utils/config'

// Encabezado blanco con la línea azul inferior, igual que la página del Grupo
// de Pronóstico: título, nombre de la institución y la etiqueta "Actividad Final".
export default function Encabezado() {
  return (
    <header className="no-imprimir sticky top-0 z-30 border-b-[3px] border-primario bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex min-h-[66px] max-w-6xl items-center gap-3 px-4 py-2 sm:gap-4 sm:px-8">
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
