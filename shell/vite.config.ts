import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FragmentGateway, getWebMiddleware } from 'web-fragments/gateway'

const fragmentId = 'remote-example'
const gateway = new FragmentGateway()
const webFragmentsMiddleware = getWebMiddleware(gateway, { mode: 'development' })
const skipHeaderName = 'x-wf-skip'

gateway.registerFragment({
  fragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5174',
  routePatterns: ['/remote/', '/remote/:_*'],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'web-fragments-gateway',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.headers[skipHeaderName]) {
            next()
            return
          }

          const host = req.headers.host ?? 'localhost:5173'
          const url = new URL(req.url ?? '/', `http://${host}`)
          const fragmentIdHeader = req.headers['x-web-fragment-id']
          const requestFragmentId = Array.isArray(fragmentIdHeader)
            ? fragmentIdHeader[0]
            : fragmentIdHeader
          const matchedFragment = gateway.matchRequestToFragment(
            `${url.pathname}${url.search}`,
            requestFragmentId,
          )

          if (!matchedFragment) {
            next()
            return
          }

          const init: RequestInit = {
            method: req.method,
            headers: req.headers as HeadersInit,
          }

          if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
            init.body = req as unknown as BodyInit
            init.duplex = 'half'
          }

          const request = new Request(url, init)

          const nextResponse = async () => {
            const headers = new Headers(request.headers)
            headers.set(skipHeaderName, '1')
            headers.delete('x-web-fragment-id')

            const nextInit: RequestInit = {
              method: request.method,
              headers,
            }

            if (request.method !== 'GET' && request.method !== 'HEAD') {
              nextInit.body = request.body
              nextInit.duplex = 'half'
            }

            return fetch(url, nextInit)
          }

          webFragmentsMiddleware(request, nextResponse)
            .then(async (response) => {
              res.statusCode = response.status
              response.headers.forEach((value, key) => {
                res.setHeader(key, value)
              })

              if (!response.body) {
                res.end()
                return
              }

              const body = Buffer.from(await response.arrayBuffer())
              res.end(body)
            })
            .catch(next)
        })
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
})
