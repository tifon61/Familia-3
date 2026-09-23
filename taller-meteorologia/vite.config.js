import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' hace que las rutas del build sean relativas, así la app funciona
// servida desde cualquier subcarpeta (por ejemplo GitHub Pages en /meteo/).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    // El build se publica en /meteo del repo para que GitHub Pages lo sirva
    // sin necesitar un paso de compilación en el servidor.
    outDir: '../meteo',
    emptyOutDir: true,
  },
})
