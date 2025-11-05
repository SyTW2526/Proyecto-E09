import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: 'src/client', // <-- La raíz del cliente ahora es src/client
  plugins: [react()],
  publicDir: '../../public', // se mantiene la carpeta public si la usas
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../../dist/client', // salida relativa a root (src/client)
    emptyOutDir: true // limpia antes de construir
  }
})
