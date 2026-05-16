import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { clearLogs, getLogs, logsAsText } from '../lib/upload-logger'
import { reportError } from '../lib/error-reporter'

const ALLOWED_EMAIL = 'melissa.pontes@gmail.com'

export function DebugLogViewer() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  if (user?.email !== ALLOWED_EMAIL) return null

  async function handleSend() {
    const text = logsAsText()
    await reportError(new Error('LOG DUMP — ' + text), 'debug-log-viewer')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 12,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid #fff3',
          borderRadius: 12,
          padding: '6px 12px',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        🪲 logs
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.92)',
            overflowY: 'auto',
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#ccc',
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => void handleSend()}
              style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12 }}
            >
              {sent ? '✓ Enviado' : 'Enviar por email'}
            </button>
            <button
              type="button"
              onClick={() => { clearLogs(); setOpen(false) }}
              style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12 }}
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12 }}
            >
              Fechar
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {getLogs().length === 0 ? '(sem logs)' : logsAsText()}
          </pre>
        </div>
      )}
    </>
  )
}
