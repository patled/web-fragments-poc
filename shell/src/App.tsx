import { useEffect, useState, useRef } from 'react'

function App() {
  const needsRemoteSlash = globalThis.location.pathname === '/remote'
  const isRemoteRoute = globalThis.location.pathname.startsWith('/remote/')
  const [shellData, setShellData] = useState('')
  const [receivedData, setReceivedData] = useState<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (needsRemoteSlash) {
      globalThis.location.replace('/remote/')
    }
  }, [needsRemoteSlash])

  useEffect(() => {
    if (isRemoteRoute) {
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
  }, [isRemoteRoute])

  const sendDataToFragment = () => {
    if (channelRef.current && shellData.trim()) {
      channelRef.current.postMessage({
        type: 'shell-to-fragment',
        payload: shellData,
        timestamp: new Date().toISOString(),
      })
      setShellData('')
    }
  }

  if (needsRemoteSlash) {
    return null
  }

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2.5rem' }}>
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Shell Host</h1>
        <p style={{ maxWidth: '48rem', color: '#4b5563' }}>
          This host renders a Web Fragment provided by the remote app. Navigate to the
          fragment route to see it mounted.
        </p>
        <a href="/remote/">Open the remote fragment</a>
      </section>

      {isRemoteRoute && (
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
            Shell → Fragment Communication
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
              disabled={!shellData.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: shellData.trim() ? 'pointer' : 'not-allowed',
                opacity: shellData.trim() ? 1 : 0.5,
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

      {isRemoteRoute ? (
        <web-fragment fragment-id="remote-example"></web-fragment>
      ) : (
        <p style={{ color: '#6b7280' }}>Open /remote to mount the fragment.</p>
      )}
    </main>
  )
}

export default App
