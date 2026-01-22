import { useMemo } from 'react'
import RemoteFragment from './RemoteFragment'
import SecondFragment from './SecondFragment'

function App() {
  // Bestimme basierend auf dem aktuellen Pfad oder Query-Parameter, welche Komponente gerendert werden soll
  // Das Gateway transformiert /second/ zu /remote/?_fragment=second, daher prüfen wir beide
  const isSecondFragment = useMemo(() => {
    const currentPath = globalThis.location.pathname
    const searchParams = new URLSearchParams(globalThis.location.search)
    // Prüfe sowohl den Pfad als auch den Query-Parameter
    return currentPath.startsWith('/second/') || searchParams.get('_fragment') === 'second'
  }, [])

  return (
    <div style={{ backgroundColor: isSecondFragment ? '#e3f2fd' : 'green' }}>
      {isSecondFragment ? <SecondFragment /> : <RemoteFragment />}
    </div>
  )
}

export default App
