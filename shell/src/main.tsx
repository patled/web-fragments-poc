import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeWebFragments } from 'web-fragments'
import App from './App.tsx'
import { ThemeProvider } from './ThemeContext.tsx'
import './theme.css'

initializeWebFragments()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
