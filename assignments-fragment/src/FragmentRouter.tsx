import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'

type FragmentId = 'project-assignments'
type BasePath = '/assignments'

function FragmentRouteSync({
  fragmentId,
  basePath,
}: {
  fragmentId: FragmentId
  basePath: BasePath
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const latestRouterUrlRef = useRef<string>('')

  useEffect(() => {
    latestRouterUrlRef.current = `${location.pathname}${location.search}${location.hash}`
  }, [location.hash, location.pathname, location.search])

  useEffect(() => {
    const channel = new BroadcastChannel('shell-fragment-communication')
    channelRef.current = channel

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type !== 'shell-navigate' ||
        event.data?.fragmentId !== fragmentId ||
        typeof event.data?.payload !== 'string'
      ) {
        return
      }

      const rawUrl = event.data.payload
      const url = new URL(rawUrl, globalThis.location.origin)

      if (!url.pathname.startsWith(`${basePath}/`)) {
        return
      }

      const relativePathname = url.pathname.slice(basePath.length) || '/'
      const nextRouterUrl = `${relativePathname}${url.search}${url.hash}`

      if (nextRouterUrl !== latestRouterUrlRef.current) {
        navigate(nextRouterUrl, { replace: true })
      }
    }

    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
      channelRef.current = null
    }
  }, [basePath, fragmentId, navigate])

  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return

    const fullPathname = `${basePath}${location.pathname === '/' ? '/' : location.pathname}`
    const nextUrl = `${fullPathname}${location.search}${location.hash}`

    channel.postMessage({
      type: 'fragment-navigate',
      fragmentId,
      payload: nextUrl,
      timestamp: new Date().toISOString(),
    })
  }, [basePath, fragmentId, location.hash, location.pathname, location.search])

  return null
}

export function FragmentRouter({
  fragmentId,
  basePath,
  children,
}: PropsWithChildren<{ fragmentId: FragmentId; basePath: BasePath }>) {
  const initialEntry = useMemo(
    () =>
      `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`,
    [],
  )

  return (
    <MemoryRouter basename={basePath} initialEntries={[initialEntry]}>
      <FragmentRouteSync fragmentId={fragmentId} basePath={basePath} />
      {children}
    </MemoryRouter>
  )
}
