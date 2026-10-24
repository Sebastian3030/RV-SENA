import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// El proxy envía /api y /storage a Laravel, así no hay problemas de CORS en desarrollo.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/storage': 'http://localhost:8000',
    },
  },
})
