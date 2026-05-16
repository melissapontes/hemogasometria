import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { AuthProvider } from './auth/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { reportError } from './lib/error-reporter'

// DevTools mobile — ativar via ?debug=true na URL
if (new URLSearchParams(window.location.search).has('debug')) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (import('eruda') as Promise<any>).then((m) => m.default.init())
}

window.addEventListener('error', (event) => {
  reportError(event.error ?? event.message, 'window.error')
})

window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, 'unhandledrejection')
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
