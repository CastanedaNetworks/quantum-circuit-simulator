import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/quantum-circuit-simulator/',
  // Strip debug logging from production bundles while keeping it in dev.
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
