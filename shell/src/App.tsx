import { useEffect } from 'react'

function App() {
  const needsRemoteSlash = window.location.pathname === '/remote'
  const isRemoteRoute = window.location.pathname.startsWith('/remote/')

  useEffect(() => {
    if (needsRemoteSlash) {
      window.location.replace('/remote/')
    }
  }, [needsRemoteSlash])

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

      {isRemoteRoute ? (
        <web-fragment fragment-id="remote-example"></web-fragment>
      ) : (
        <p style={{ color: '#6b7280' }}>Open /remote to mount the fragment.</p>
      )}
    </main>
  )
}

export default App
