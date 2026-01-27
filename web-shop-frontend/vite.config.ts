import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Production build настройки
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Използваме esbuild вместо terser (по-бърз и вградено в Vite)
  },
  // Preview настройки (за тестване на production build)
  preview: {
    port: 4173,
    strictPort: true,
  },
})
