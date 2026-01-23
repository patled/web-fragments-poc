import { useMemo } from 'react'
import { FragmentRouter } from './FragmentRouter'
import RemoteFragmentRoutes from './RemoteFragmentRoutes'
import SecondFragmentRoutes from './SecondFragmentRoutes'

function App() {
  // Determine which component to render based on the current path or query parameter
  // The gateway transforms /second/ to /remote/?_fragment=second, so we check both
  const isSecondFragment = useMemo(() => {
    const currentPath = globalThis.location.pathname
    const searchParams = new URLSearchParams(globalThis.location.search)
    // Check both the path and the query parameter
    return currentPath.startsWith('/second/') || searchParams.get('_fragment') === 'second'
  }, [])

  return (
    <div style={{ backgroundColor: isSecondFragment ? '#e3f2fd' : 'green' }}>
      {isSecondFragment ? (
        <FragmentRouter fragmentId="second-example" basePath="/second">
          <SecondFragmentRoutes />
        </FragmentRouter>
      ) : (
        <FragmentRouter fragmentId="remote-example" basePath="/remote">
          <RemoteFragmentRoutes />
        </FragmentRouter>
      )}
    </div>
  )
}

export default App
