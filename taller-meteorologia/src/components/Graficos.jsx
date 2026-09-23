import { CheckCircle2 } from 'lucide-react'
import { formatoPorcentaje } from '../utils/analisis'

// Gráficos simples hechos con divs (sin librerías). Reglas que siguen:
// - Barras finas (máx. 24px) que crecen desde una única línea base, con la
//   punta redondeada y la base recta.
// - El valor siempre escrito al lado de la barra: nunca hace falta pasar el
//   mouse para leer un dato (el "title" solo agrega el detalle de cantidades).
// - El texto usa colores de texto, no el color de la barra.

const COLOR_BARRA = '#003f6b' // primario
const COLOR_CORRECTA = '#00796b' // verde: solo para marcar la respuesta correcta
const COLOR_OTRA = '#b8c4d2' // gris: resto de las opciones (validado vs. el verde)

// Barra horizontal: etiqueta a la izquierda, barra y valor a la derecha.
export function BarraHorizontal({ etiqueta, detalle, valor, texto, color = COLOR_BARRA, icono, titulo }) {
  return (
    <div
      className="group grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center sm:gap-4"
      title={titulo}
      tabIndex={0}
      aria-label={`${etiqueta}: ${texto}`}
    >
      <div className="min-w-0 text-sm">
        <span className="font-bold text-texto">{etiqueta}</span>
        {detalle && <span className="block truncate text-xs text-apagado">{detalle}</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative h-5 flex-1">
          <div
            className="h-full rounded-r transition-[width,filter] duration-500 group-hover:brightness-110 group-focus:brightness-110"
            style={{ width: `${Math.max(valor * 100, valor > 0 ? 1.5 : 0)}%`, background: color }}
          />
        </div>
        <span className="flex w-24 shrink-0 items-center gap-1 text-sm font-extrabold tabular-nums text-texto">
          {icono}
          {texto}
        </span>
      </div>
    </div>
  )
}

// Distribución de las opciones elegidas en una pregunta de opción múltiple.
export function DistribucionOpciones({ datos, cantidad }) {
  const { pregunta, opciones, porcentaje } = datos
  return (
    <div className="rounded-xl border border-borde p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-wide text-apagado">{pregunta.corta}</p>
        <p className="text-sm font-extrabold text-verde">{formatoPorcentaje(porcentaje)} acertó</p>
      </div>
      <p className="mt-1 text-sm font-bold text-texto">{pregunta.enunciado}</p>
      <div className="mt-3 space-y-2.5">
        {opciones.map((o) => (
          <div key={o.id} title={`${o.cantidad} de ${cantidad} personas`} tabIndex={0} className="group">
            <p className={`flex items-start gap-1.5 text-xs leading-snug ${o.esCorrecta ? 'font-bold text-texto' : 'text-apagado'}`}>
              {o.esCorrecta && <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-verde" aria-hidden="true" />}
              <span>
                {o.texto}
                {o.esCorrecta && <span className="ml-1 rounded bg-[#e0f2f1] px-1.5 py-px text-[10px] font-extrabold uppercase text-verde">Correcta</span>}
              </span>
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-3.5 flex-1">
                <div
                  className="h-full rounded-r transition-[width,filter] duration-500 group-hover:brightness-110"
                  style={{ width: `${Math.max(o.porcentaje * 100, o.porcentaje > 0 ? 1.5 : 0)}%`, background: o.esCorrecta ? COLOR_CORRECTA : COLOR_OTRA }}
                />
              </div>
              <span className="w-20 shrink-0 text-xs font-bold tabular-nums text-texto">
                {formatoPorcentaje(o.porcentaje)} <span className="font-semibold text-apagado">({o.cantidad})</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Columnas verticales: cuántas personas sacaron 0, 1, 2… respuestas correctas.
export function ColumnasPuntaje({ distribucion, total }) {
  const maximo = Math.max(1, ...distribucion.map((d) => d.cantidad))
  return (
    <div>
      <div className="flex h-44 items-end gap-2 border-b border-borde sm:gap-4">
        {distribucion.map((d) => (
          <div
            key={d.correctas}
            className="group flex h-full flex-1 flex-col items-center justify-end"
            title={`${d.cantidad} ${d.cantidad === 1 ? 'persona' : 'personas'} con ${d.correctas} de ${total} correctas`}
            tabIndex={0}
            aria-label={`${d.correctas} de ${total} correctas: ${d.cantidad} personas`}
          >
            <span className="mb-1 text-sm font-extrabold tabular-nums text-texto">{d.cantidad}</span>
            <div
              className="w-full max-w-[24px] rounded-t transition-[height,filter] duration-500 group-hover:brightness-110"
              style={{ height: `${(d.cantidad / maximo) * 80}%`, background: COLOR_BARRA, minHeight: d.cantidad ? 3 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 sm:gap-4">
        {distribucion.map((d) => (
          <span key={d.correctas} className="flex-1 text-center text-xs font-bold tabular-nums text-apagado">
            {d.correctas}/{total}
          </span>
        ))}
      </div>
    </div>
  )
}

// Medidor chico para tablas (promedio de aciertos).
export function Medidor({ valor }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-celeste-suave">
        <div className="h-full rounded-full" style={{ width: `${valor * 100}%`, background: COLOR_BARRA }} />
      </div>
      <span className="text-sm font-bold tabular-nums text-texto">{formatoPorcentaje(valor)}</span>
    </div>
  )
}
