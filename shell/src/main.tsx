import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeWebFragments } from 'web-fragments'
import App from './App.tsx'

initializeWebFragments()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
