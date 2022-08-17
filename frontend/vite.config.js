import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {    // <-- this object is added
    port: 8000
  },
  plugins: [react()]
})
