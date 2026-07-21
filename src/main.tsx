import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Removes the static #initial-loader (defined inline in index.html) once
// this has actually painted, so there's a graceful crossfade instead of a
// hard cut from the loading dots to the real page.
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader')
  if (!loader) return
  loader.classList.add('is-hidden')
  window.setTimeout(() => loader.remove(), 400)
}

function Root() {
  useEffect(() => {
    // rAF so this fires after the browser has actually painted the first
    // real frame of the app, not just after React finishes committing.
    const raf = requestAnimationFrame(hideInitialLoader)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
