import { useMemo } from 'react'
import RemoteFragment from './RemoteFragment'
import SecondFragment from './SecondFragment'

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
      {isSecondFragment ? <SecondFragment /> : <RemoteFragment />}
    </div>
  )
}

export default App
