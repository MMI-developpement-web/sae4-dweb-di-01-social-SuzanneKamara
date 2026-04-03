import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/~kamara4/SAE4.DWeb-DI.01/CycleB/sae4-dweb-di-01-social-SuzanneKamara/frontend/dist/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    port: 4173,
    strictPort: false,
    proxy: {
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    origin: "http://localhost:8090",
    allowedHosts: ["sae-frontend"],
    proxy: {
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});