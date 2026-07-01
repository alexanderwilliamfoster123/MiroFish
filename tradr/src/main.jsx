import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'

// Restore persisted theme (matches prototype behaviour).
try {
  const t = localStorage.getItem('tradrTheme')
  if (t) document.documentElement.setAttribute('data-theme', t)
} catch (e) { /* ignore */ }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)
