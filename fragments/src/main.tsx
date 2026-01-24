import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from './App.tsx'

const STORAGE_KEY = 'app-theme'
const THEME_CHANNEL = 'app-theme-channel'

type ThemeMode = 'light' | 'dark'

function getStoredTheme(): ThemeMode {
  if (globalThis.window === undefined) return 'light'
  const stored = globalThis.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored
  if (globalThis.window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#1976d2' },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#66bb6a' },
    secondary: { main: '#42a5f5' },
  },
})

function AppWithTheme() {
  const [mode, setMode] = useState<ThemeMode>(getStoredTheme)

  useEffect(() => {
    const channel = new BroadcastChannel(THEME_CHANNEL)
    channel.postMessage({ type: 'theme-request' })
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'theme-change' && e.data?.payload?.mode) {
        const m = e.data.payload.mode as ThemeMode
        if (m === 'light' || m === 'dark') setMode(m)
      }
    }
    channel.addEventListener('message', handleMessage)
    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const m = e.newValue as ThemeMode
        if (m === 'light' || m === 'dark') setMode(m)
      }
    }
    globalThis.addEventListener('storage', handleStorage)
    return () => globalThis.removeEventListener('storage', handleStorage)
  }, [])

  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithTheme />
  </StrictMode>,
)
