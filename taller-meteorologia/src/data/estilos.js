// Tailwind solo genera las clases que encuentra escritas completas en el
// código. Por eso NO podemos armar `text-${color}-400` dinámicamente: hay que
// listar cada combinación entera, como en este mapa.
export const acentos = {
  sky: {
    icono: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
    borde: 'hover:border-sky-400/60',
    texto: 'text-sky-300',
  },
  indigo: {
    icono: 'bg-indigo-500/15 text-indigo-300 ring-indigo-400/30',
    borde: 'hover:border-indigo-400/60',
    texto: 'text-indigo-300',
  },
  emerald: {
    icono: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    borde: 'hover:border-emerald-400/60',
    texto: 'text-emerald-300',
  },
  amber: {
    icono: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    borde: 'hover:border-amber-400/60',
    texto: 'text-amber-300',
  },
}
