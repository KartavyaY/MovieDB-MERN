import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'kartavyayadav.in',
      'www.kartavyayadav.in'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'kartavyayadav.in',
      'www.kartavyayadav.in'
    ]
  }
})
