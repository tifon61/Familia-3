import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// viteSingleFile mete el JS y el CSS dentro del index.html: queda UN solo
// archivo, fácil de subir a mano a cualquier repositorio.
// base: './' hace que las rutas del build sean relativas, así la app funciona
// servida desde cualquier subcarpeta (por ejemplo GitHub Pages en /meteo/).
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
  build: {
    // El build se publica en /meteo del repo para que GitHub Pages lo sirva
    // sin necesitar un paso de compilación en el servidor.
    outDir: '../meteo',
    emptyOutDir: true,
  },
})
