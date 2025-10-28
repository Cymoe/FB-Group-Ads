import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // MongoDB configuration
  const mongoUri = env.VITE_MONGODB_URI

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy API requests to MongoDB server
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
