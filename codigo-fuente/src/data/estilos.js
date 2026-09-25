// Color de cada situación, dentro de la paleta del Grupo de Pronóstico.
// Tailwind solo genera las clases que encuentra escritas completas en el
// código. Por eso NO podemos armar `bg-${color}` dinámicamente: hay que
// listar cada combinación entera, como en este mapa.
export const acentos = {
  oscuro: { cabecera: 'bg-primario', texto: 'text-primario', borde: 'hover:border-primario' },
  celeste: { cabecera: 'bg-secundario', texto: 'text-primario-medio', borde: 'hover:border-secundario' },
  verde: { cabecera: 'bg-verde', texto: 'text-verde', borde: 'hover:border-verde' },
  medio: { cabecera: 'bg-primario-medio', texto: 'text-primario-medio', borde: 'hover:border-primario-medio' },
}
