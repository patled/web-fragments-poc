import { useEffect, useState, useRef } from 'react'

function App() {
  const needsRemoteSlash = globalThis.location.pathname === '/remote'
  const needsSecondSlash = globalThis.location.pathname === '/second'
  const isRemoteRoute = globalThis.location.pathname.startsWith('/remote/')
  const isSecondRoute = globalThis.location.pathname.startsWith('/second/')
  const [shellData, setShellData] = useState('')
  const [receivedData, setReceivedData] = useState<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  // Bestimme das aktive Fragment basierend auf der Route
  let activeFragmentId: string | null = null
  if (isRemoteRoute) {
    activeFragmentId = 'remote-example'
  } else if (isSecondRoute) {
    activeFragmentId = 'second-example'
  }

  useEffect(() => {
    if (needsRemoteSlash) {
      globalThis.location.replace('/remote/')
    }
    if (needsSecondSlash) {
      globalThis.location.replace('/second/')
    }
  }, [needsRemoteSlash, needsSecondSlash])

  useEffect(() => {
    if (isRemoteRoute || isSecondRoute) {
      // BroadcastChannel für Kommunikation mit Fragment erstellen
      const channel = new BroadcastChannel('shell-fragment-communication')
      channelRef.current = channel

      // Nachrichten vom Fragment empfangen
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'fragment-to-shell') {
          setReceivedData(event.data.payload)
        }
      }

      channel.addEventListener('message', handleMessage)

      return () => {
        channel.removeEventListener('message', handleMessage)
        channel.close()
        channelRef.current = null
      }
    }
  }, [isRemoteRoute, isSecondRoute])

  const sendDataToFragment = () => {
    if (channelRef.current && shellData.trim() && activeFragmentId) {
      channelRef.current.postMessage({
        type: 'shell-to-fragment',
        fragmentId: activeFragmentId,
        payload: shellData,
        timestamp: new Date().toISOString(),
      })
      setShellData('')
    }
  }

  if (needsRemoteSlash || needsSecondSlash) {
    return null
  }

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2.5rem' }}>
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Shell Host</h1>
        <p style={{ maxWidth: '48rem', color: '#4b5563' }}>
          This host renders Web Fragments provided by the remote app. Navigate to the
          fragment routes to see them mounted.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a href="/remote/">Open the remote fragment</a>
          <a href="/second/">Open the second fragment</a>
        </div>
      </section>

      {(isRemoteRoute || isSecondRoute) && (
        <section
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Shell → Fragment Communication ({activeFragmentId})
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={shellData}
              onChange={(e) => setShellData(e.target.value)}
              placeholder="Daten an Fragment senden..."
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendDataToFragment()
                }
              }}
            />
            <button
              onClick={sendDataToFragment}
              disabled={!shellData.trim() || !activeFragmentId}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: shellData.trim() && activeFragmentId ? 'pointer' : 'not-allowed',
                opacity: shellData.trim() && activeFragmentId ? 1 : 0.5,
              }}
            >
              Senden
            </button>
          </div>
          {receivedData && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '4px',
                marginTop: '1rem',
              }}
            >
              <strong>Empfangen vom Fragment:</strong>
              <div style={{ marginTop: '0.5rem', color: '#1e40af' }}>{receivedData}</div>
            </div>
          )}
        </section>
      )}

      {isRemoteRoute && <web-fragment fragment-id="remote-example"></web-fragment>}
      {isSecondRoute && <web-fragment fragment-id="second-example"></web-fragment>}
      {!isRemoteRoute && !isSecondRoute && (
        <p style={{ color: '#6b7280' }}>Open /remote/ or /second/ to mount a fragment.</p>
      )}
    </main>
  )
}

export default App
