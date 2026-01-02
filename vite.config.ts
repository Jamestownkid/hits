import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// yo this is the vite config for the renderer process
// electron main process uses tsc directly cause vite dont play nice with electron main
export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})

