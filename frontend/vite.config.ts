import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      proxy: { '/generate': { target, changeOrigin: true } },
    },
  }
})