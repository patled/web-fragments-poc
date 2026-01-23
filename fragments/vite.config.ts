import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // base is required for asset paths when called via gateway
  // For direct access on the fragments server, both routes still work
  base: '/first/',
  plugins: [
    react(),
    {
      // Vite serves HTML below `base` by default (here: /first/).
      // So that `http://localhost:5174/second/` also loads the SPA in DEV (and thus
      // `location.pathname` remains `/second/`), we also serve `index.html` there.
      name: 'serve-second-fragment-spa-route',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? '/'

          // /second -> /second/ (analogous to Shell)
          if (url === '/second') {
            res.statusCode = 302
            res.setHeader('Location', '/second/')
            res.end()
            return
          }

          if (!url.startsWith('/second/')) {
            next()
            return
          }

          // Not an HTML request? Then let Vite handle it normally.
          const acceptHeader = req.headers.accept ?? ''
          const wantsHtml = acceptHeader.includes('text/html')

          // Asset/Dev requests should not fall back to index.html.
          const isAssetRequest =
            url.includes('.') ||
            url.startsWith('/second/@') ||
            url.startsWith('/second/src') ||
            url.startsWith('/second/node_modules')

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
    port: 5174,
    strictPort: true,
  },
})
