import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Explicitly allow VITE_* env vars to be passed through.
  // Vite already does this by default, but listing them here
  // makes the required variables visible in source control.
  envPrefix: 'VITE_',
})
