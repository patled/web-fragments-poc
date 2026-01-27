import { useEffect, useMemo, useRef, useState } from 'react'

const FRAGMENT_ID = 'showcase-lab'
const CHANNEL_NAME = 'showcase-fragment-channel'

const accentOptions = [
  { id: 'electric', label: 'Electric Blue', color: '#4f7cff' },
  { id: 'mint', label: 'Neon Mint', color: '#18d6a3' },
  { id: 'sunset', label: 'Sunset Amber', color: '#ff9a3c' },
  { id: 'orchid', label: 'Orchid Glow', color: '#b86bff' },
]

const densityOptions = [
  { id: 'cozy', label: 'Cozy' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'compact', label: 'Compact' },
]

const motionOptions = [
  { id: 'ambient', label: 'Ambient' },
  { id: 'snappy', label: 'Snappy' },
  { id: 'still', label: 'Still' },
]

const featureCards = [
  {
    title: 'Isolated State',
    description:
      'Try the counter to see state managed entirely inside this fragment.',
  },
  {
    title: 'Live Events',
    description:
      'Broadcast a message to the shell and watch it appear instantly.',
  },
  {
    title: 'Theming Controls',
    description:
      'Switch accent, density, and motion to simulate design system settings.',
  },
  {
    title: 'Standalone Friendly',
    description:
      'Runs independently in its own dev server or inside the shell.',
  },
]

const capabilityChips = [
  'Isolated JS context',
  'Shared URL space',
  'Event bridge',
  'Fast refresh',
]

export function ShowcaseFragment() {
  const [accentId, setAccentId] = useState(accentOptions[0].id)
  const [densityId, setDensityId] = useState(densityOptions[1].id)
  const [motionId, setMotionId] = useState(motionOptions[0].id)
  const [counter, setCounter] = useState(6)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const accent = useMemo(
    () => accentOptions.find((option) => option.id === accentId) ?? accentOptions[0],
    [accentId],
  )

  useEffect(() => {
    try {
      setIsStandalone(window.self === window.top)
    } catch {
      setIsStandalone(true)
    }
  }, [])

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel
    channel.postMessage({
      type: 'showcase-ready',
      fragmentId: FRAGMENT_ID,
      payload: { status: 'ready' },
      timestamp: new Date().toISOString(),
    })
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return
    channel.postMessage({
      type: 'showcase-settings',
      fragmentId: FRAGMENT_ID,
      payload: {
        accent: accent.label,
        density: densityId,
        motion: motionId,
        counter,
      },
      timestamp: new Date().toISOString(),
    })
  }, [accent.label, counter, densityId, motionId])

  const sendPulse = () => {
    const timestamp = new Date().toISOString()
    channelRef.current?.postMessage({
      type: 'showcase-pulse',
      fragmentId: FRAGMENT_ID,
      payload: {
        accent: accent.label,
        density: densityId,
        motion: motionId,
        counter,
      },
      timestamp,
    })
    setLastSentAt(timestamp)
  }

  return (
    <div
      style={{
        fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
        color: '#0f172a',
        padding: '1.75rem',
        borderRadius: '1.25rem',
        border: '1px solid rgba(15, 23, 42, 0.12)',
        background:
          'linear-gradient(135deg, rgba(240, 244, 255, 0.9), rgba(255, 255, 255, 0.98))',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
      }}
    >
      {isStandalone ? (
        <div
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <span>🧪</span>
          <span>Standalone mode: fragment running solo.</span>
        </div>
      ) : null}

      <header style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 18rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
            Web Fragment Showcase
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>
            A playful lab to explore isolation, events, and UI customization from
            inside a fragment.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {capabilityChips.map((chip) => (
            <span
              key={chip}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(79, 124, 255, 0.12)',
                color: '#1e293b',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        {featureCards.map((card) => (
          <div
            key={card.title}
            style={{
              padding: '1rem',
              borderRadius: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              minHeight: '110px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{card.title}</h3>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section
        style={{
          marginTop: '1.75rem',
          padding: '1.25rem',
          borderRadius: '1rem',
          border: '1px dashed rgba(99, 102, 241, 0.4)',
          backgroundColor: 'rgba(249, 250, 255, 0.9)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Live Controls</h2>
        <p style={{ margin: '0.4rem 0 1rem', color: '#475569', fontSize: '0.9rem' }}>
          Tweak the fragment state and broadcast the changes to the shell.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
            Accent palette
            <select
              value={accentId}
              onChange={(event) => setAccentId(event.target.value)}
              style={{
                padding: '0.45rem 0.6rem',
                borderRadius: '0.6rem',
                border: `1px solid ${accent.color}`,
                backgroundColor: 'white',
              }}
            >
              {accentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
            Density
            <select
              value={densityId}
              onChange={(event) => setDensityId(event.target.value)}
              style={{
                padding: '0.45rem 0.6rem',
                borderRadius: '0.6rem',
                border: '1px solid rgba(148, 163, 184, 0.6)',
                backgroundColor: 'white',
              }}
            >
              {densityOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
            Motion
            <select
              value={motionId}
              onChange={(event) => setMotionId(event.target.value)}
              style={{
                padding: '0.45rem 0.6rem',
                borderRadius: '0.6rem',
                border: '1px solid rgba(148, 163, 184, 0.6)',
                backgroundColor: 'white',
              }}
            >
              {motionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
            Counter
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCounter((value) => Math.max(0, value - 1))}
                style={{
                  borderRadius: '0.55rem',
                  border: '1px solid rgba(148, 163, 184, 0.6)',
                  backgroundColor: 'white',
                  padding: '0.35rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{counter}</span>
              <button
                type="button"
                onClick={() => setCounter((value) => value + 1)}
                style={{
                  borderRadius: '0.55rem',
                  border: '1px solid rgba(148, 163, 184, 0.6)',
                  backgroundColor: 'white',
                  padding: '0.35rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={sendPulse}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              backgroundColor: accent.color,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(79, 124, 255, 0.25)',
            }}
          >
            Pulse the Shell
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {lastSentAt
              ? `Last pulse: ${new Date(lastSentAt).toLocaleTimeString()}`
              : 'No pulse sent yet.'}
          </span>
        </div>
      </section>

      <section style={{ marginTop: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.6rem', fontSize: '1.1rem' }}>
          Try these experiments
        </h2>
        <ol style={{ margin: 0, paddingLeft: '1.1rem', color: '#475569' }}>
          <li>Change the accent palette and note that the shell stays untouched.</li>
          <li>Pulse the shell to send a cross-app event.</li>
          <li>Adjust density + motion to simulate design-system settings.</li>
        </ol>
      </section>
    </div>
  )
}
