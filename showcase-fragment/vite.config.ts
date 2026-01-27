import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

const basePath = '/showcase/'

// https://vite.dev/config/
export default defineConfig({
  // base is required for asset paths when called via gateway
  base: basePath,
  plugins: [
    react(),
    {
      name: 'serve-showcase-fragment-spa-route',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? '/'

          if (url === basePath.slice(0, -1)) {
            res.statusCode = 302
            res.setHeader('Location', basePath)
            res.end()
            return
          }

          if (!url.startsWith(basePath)) {
            next()
            return
          }

          const acceptHeader = req.headers.accept ?? ''
          const wantsHtml = acceptHeader.includes('text/html')

          const isAssetRequest =
            url.includes('.') ||
            url.startsWith(`${basePath}@`) ||
            url.startsWith(`${basePath}src`) ||
            url.startsWith(`${basePath}node_modules`)

          if (!wantsHtml || isAssetRequest) {
            next()
            return
          }

          try {
            const indexPath = path.resolve(server.config.root, 'index.html')
            let html = await fs.readFile(indexPath, 'utf-8')
            html = await server.transformIndexHtml(url, html)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
          } catch (error) {
            next(error)
          }
        })
      },
    },
  ],
  server: {
    port: 5176,
    strictPort: true,
  },
})
