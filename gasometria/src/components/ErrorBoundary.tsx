import { Component, type ReactNode } from 'react'
import { reportError } from '../lib/error-reporter'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportError(error, `React: ${info.componentStack.slice(0, 500)}`)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-dvh flex-col items-center justify-center px-4"
          style={{ background: '#0f0f13' }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <p className="text-lg font-bold text-white">Algo deu errado</p>
            <p className="mt-2 text-sm text-white/60">
              O erro foi reportado automaticamente. Recarregue a página.
            </p>
            <button
              className="mt-6 rounded-2xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
