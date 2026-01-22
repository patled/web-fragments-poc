import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FragmentGateway, getWebMiddleware } from 'web-fragments/gateway'

const fragmentId = 'remote-example'
const secondFragmentId = 'second-example'
const gateway = new FragmentGateway()
const webFragmentsMiddleware = getWebMiddleware(gateway, { mode: 'development' })
const skipHeaderName = 'x-wf-skip'

gateway.registerFragment({
  fragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5174',
  routePatterns: ['/remote/', '/remote/:_*'],
})

gateway.registerFragment({
  fragmentId: secondFragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5174',
  routePatterns: ['/second/', '/second/:_*'],
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
          
          // Prüfe, ob es eine Asset-Anfrage ist
          const isAssetRequest = url.pathname.includes('.') || 
                                 url.pathname.startsWith('/@') ||
                                 url.pathname.startsWith('/node_modules') ||
                                 url.pathname.startsWith('/src')
          
          // Prüfe, ob es eine Fragment-Route ist
          const isFragmentRoute = url.pathname.startsWith('/remote/') || url.pathname.startsWith('/second/')
          
          // Prüfe, ob es eine direkte Browser-Navigation ist
          // Das <web-fragment> Element sendet Anfragen in einem IFrame
          const fetchDest = req.headers['sec-fetch-dest']
          const isIframeRequest = fetchDest === 'iframe'
          const isDirectBrowserNavigation = !requestFragmentId && fetchDest === 'document'
          
          // Wenn es eine Fragment-Route ist, keine Asset-Anfrage, keine Fragment-ID,
          // und es ist eine direkte Browser-Navigation, lassen wir die Shell-App rendern
          // Alle anderen Anfragen (vom <web-fragment> Element) werden weitergeleitet
          if (isFragmentRoute && !isAssetRequest && !requestFragmentId && !isIframeRequest && isDirectBrowserNavigation) {
            next()
            return
          }

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

          // Transformiere /second/ zu /remote/ für Asset-Anfragen, da base: '/remote/' gesetzt ist
          // Für HTML-Anfragen fügen wir einen Query-Parameter hinzu, damit die App das richtige Fragment rendert
          let transformedPath = url.pathname
          const isSecondFragment = matchedFragment.fragmentId === secondFragmentId && url.pathname.startsWith('/second/')
          
          if (isSecondFragment) {
            // Transformiere Pfad von /second/ zu /remote/ für Assets
            transformedPath = url.pathname.replace(/^\/second\//, '/remote/')
            // Füge Query-Parameter für HTML-Anfragen hinzu
            if (!url.pathname.includes('.')) {
              const searchParams = new URLSearchParams(url.search)
              searchParams.set('_fragment', 'second')
              url.search = '?' + searchParams.toString()
            }
          }

          // Transformiere URL zum Remote-Endpoint
          const fragmentEndpoint = matchedFragment.endpoint
          const fragmentUrl = new URL(transformedPath + url.search, fragmentEndpoint)
          const request = new Request(fragmentUrl, init)

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

            return fetch(fragmentUrl, nextInit)
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
