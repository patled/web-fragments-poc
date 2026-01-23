import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FragmentGateway, getWebMiddleware } from 'web-fragments/gateway'

const fragmentId = 'first-example'
const secondFragmentId = 'second-example'
const gateway = new FragmentGateway()
const webFragmentsMiddleware = getWebMiddleware(gateway, { mode: 'development' })
const skipHeaderName = 'x-wf-skip'

gateway.registerFragment({
  fragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5174',
  routePatterns: ['/first/', '/first/:_*'],
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
          
          // Check if it's an asset request
          const isAssetRequest = url.pathname.includes('.') || 
                                 url.pathname.startsWith('/@') ||
                                 url.pathname.startsWith('/node_modules') ||
                                 url.pathname.startsWith('/src')
          
          // Check if it's a fragment route
          const isFragmentRoute = url.pathname.startsWith('/first/') || url.pathname.startsWith('/second/')
          
          // Check if it's a direct browser navigation
          // The <web-fragment> element sends requests in an IFrame
          const fetchDest = req.headers['sec-fetch-dest']
          const isIframeRequest = fetchDest === 'iframe'
          const isDirectBrowserNavigation = !requestFragmentId && fetchDest === 'document'
          
          // If it's a fragment route, not an asset request, no fragment ID,
          // and it's a direct browser navigation, let the shell app render
          // All other requests (from the <web-fragment> element) are forwarded
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

          // Transform /second/ to /first/ for asset requests, since base: '/first/' is set
          // For HTML requests, add a query parameter so the app renders the correct fragment
          let transformedPath = url.pathname
          const isSecondFragment = matchedFragment.fragmentId === secondFragmentId && url.pathname.startsWith('/second/')
          
          if (isSecondFragment) {
            // Transform path from /second/ to /first/ for assets
            transformedPath = url.pathname.replace(/^\/second\//, '/first/')
            // Add query parameter for HTML requests
            if (!url.pathname.includes('.')) {
              const searchParams = new URLSearchParams(url.search)
              searchParams.set('_fragment', 'second')
              url.search = '?' + searchParams.toString()
            }
          }

          // Transform URL to first endpoint
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
