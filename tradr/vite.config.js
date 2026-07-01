import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tradr front-end. Faithful React + Vite port of the single-file prototype.
// On build we set base to '/MiroFish/' so it works when served from GitHub Pages
// project pages (https://<user>.github.io/MiroFish/). Dev stays at '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/MiroFish/' : '/',
  server: { host: true, port: 5174 },
}))
