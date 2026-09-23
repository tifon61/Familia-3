// Lee la configuración que está escrita en el index.html (window.CONFIG_TALLER).
// Se hace así para poder cambiar valores editando el HTML publicado a mano.
const config = typeof window !== 'undefined' ? window.CONFIG_TALLER ?? {} : {}

const carpeta = config.carpetaImagenes ?? './imagenes/'

export const FORMSPREE_URL = (config.formspree ?? '').trim()
export const INSTITUCION = config.institucion ?? 'Grupo de Pronóstico'

// Nombres fijos de imágenes: si existen en la carpeta, la app las muestra;
// si no existen, simplemente no aparecen.
export const imagenes = {
  logo: `${carpeta}logo.png`,
  logoInstitucion: `${carpeta}logo-institucion.png`,
  fondo: `${carpeta}fondo.jpg`,
  situacion: (numero) => `${carpeta}situacion-${numero}.jpg`,
}
