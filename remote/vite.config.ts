import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // base wird benötigt für Asset-Pfade, wenn über Gateway aufgerufen
  // Für direkten Zugriff auf dem Remote-Server funktionieren beide Routen trotzdem
  base: '/remote/',
  plugins: [
    react(),
    {
      // Vite serve't standardmäßig HTML unterhalb von `base` (hier: /remote/).
      // Damit `http://localhost:5174/second/` in DEV ebenfalls die SPA lädt (und damit
      // `location.pathname` weiterhin `/second/` ist), serven wir dort ebenfalls `index.html`.
      name: 'serve-second-fragment-spa-route',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? '/'

          // /second -> /second/ (analog zur Shell)
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

          // Keine HTML-Anfrage? Dann Vite normal machen lassen.
          const acceptHeader = req.headers.accept ?? ''
          const wantsHtml = acceptHeader.includes('text/html')

          // Asset/Dev-Requests sollen nicht auf index.html fallen.
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
