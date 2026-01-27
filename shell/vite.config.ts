import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FragmentGateway, getWebMiddleware } from 'web-fragments/gateway'

const assignmentsFragmentId = 'project-assignments'
const showcaseFragmentId = 'showcase-lab'
const gateway = new FragmentGateway()
const webFragmentsMiddleware = getWebMiddleware(gateway, { mode: 'development' })
const skipHeaderName = 'x-wf-skip'
const lastGatewayErrorLogByFragment = new Map<string, number>()

gateway.registerFragment({
  fragmentId: assignmentsFragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5175',
  routePatterns: [
    '/assignments/',
    '/assignments/:_*',
    '/projects/:_*/assignments/',
    '/projects/:_*/assignments/:_*',
  ],
})

gateway.registerFragment({
  fragmentId: showcaseFragmentId,
  piercingClassNames: [],
  endpoint: 'http://localhost:5176',
  routePatterns: ['/showcase/', '/showcase/:_*'],
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
          const isProjectsAssignments =
            /^\/projects\/[^/]+\/assignments(\/|$)/.test(url.pathname)
          const isShowcaseRoute =
            url.pathname === '/showcase' || url.pathname.startsWith('/showcase/')
          const isFragmentRoute =
            url.pathname.startsWith('/assignments/') ||
            isProjectsAssignments ||
            isShowcaseRoute
          
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

          // Transform /projects/ID/assignments to /assignments/ID for the assignments fragment
          let transformedPath = url.pathname
          const projectsAssignmentsMatch = url.pathname.match(
            /^\/projects\/([^/]+)\/assignments\/?(.*)$/,
          )
          const isProjectsAssignmentsPath =
            matchedFragment.fragmentId === assignmentsFragmentId &&
            projectsAssignmentsMatch

          if (isProjectsAssignmentsPath && projectsAssignmentsMatch) {
            transformedPath = projectsAssignmentsMatch[2]
              ? `/assignments/${projectsAssignmentsMatch[1]}/${projectsAssignmentsMatch[2]}`
              : `/assignments/${projectsAssignmentsMatch[1]}`
          }

          // Transform URL to fragment endpoint
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

            // Add timeout for fragment requests (5 seconds)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            nextInit.signal = controller.signal

            try {
              const response = await fetch(fragmentUrl, nextInit)
              clearTimeout(timeoutId)
              return response
            } catch (error) {
              clearTimeout(timeoutId)
              // Return a 503 Service Unavailable response if fragment is not available
              return new Response(
                JSON.stringify({
                  error: 'Fragment unavailable',
                  fragmentId: matchedFragment.fragmentId,
                  endpoint: fragmentEndpoint,
                  message: error instanceof Error ? error.message : 'Unknown error',
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              )
            }
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
            .catch((error) => {
              // Don't crash the shell; throttle logs to avoid spam when a fragment is down
              const fragmentId = matchedFragment?.fragmentId ?? 'unknown'
              const now = Date.now()
              const lastLoggedAt = lastGatewayErrorLogByFragment.get(fragmentId) ?? 0
              if (now - lastLoggedAt > 10_000) {
                lastGatewayErrorLogByFragment.set(fragmentId, now)
                console.warn(`[Gateway] Fragment "${fragmentId}" unavailable:`, error)
              }

              // Return a 503 response to the client
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'Fragment unavailable',
                  fragmentId: matchedFragment?.fragmentId,
                  message: error instanceof Error ? error.message : 'Unknown error',
                }),
              )
            })
        })
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
})
