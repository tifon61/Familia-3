import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// viteSingleFile mete el JS y el CSS dentro del index.html: queda UN solo
// archivo, fácil de subir a mano a cualquier repositorio.
// base: './' hace que las rutas del build sean relativas, así la app funciona
// servida desde cualquier carpeta (la raíz del repo de la amiga, una subcarpeta…).
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
  build: {
    // El resultado va a /para-subir: es exactamente lo que se copia al repo
    // donde se publica la actividad (index.html + imagenes/).
    outDir: '../para-subir',
    emptyOutDir: true,
  },
})
