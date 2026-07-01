import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tradr front-end. Faithful React + Vite port of the single-file prototype.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5174 },
})
