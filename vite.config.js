import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production is served behind a reverse proxy, so the dev API origins used in
// src/ are rewritten to same-origin proxy paths when running `vite build`.
const apiProxyPaths = {
  'https://localhost:7228': '/svc/identity',
  'https://localhost:7029': '/svc/affiliates',
  'https://localhost:7129': '/svc/advertisers',
  'https://localhost:7150': '/svc/offers',
}

function rewriteApiOrigins() {
  return {
    name: 'rewrite-api-origins',
    apply: 'build',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules') || !code.includes('https://localhost:')) return null
      let out = code
      for (const [origin, path] of Object.entries(apiProxyPaths)) {
        out = out.replaceAll(origin, path)
      }
      return { code: out, map: null }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [rewriteApiOrigins(), react()],
})
