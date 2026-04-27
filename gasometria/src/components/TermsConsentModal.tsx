import { useState } from 'react'
import { BloodDropIcon } from './ui/BloodDropIcon'

type TermsConsentModalProps = {
  onAccept: () => Promise<void>
  onSignOut: () => Promise<void>
}

export function TermsConsentModal({ onAccept, onSignOut }: TermsConsentModalProps) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleAccept() {
    setIsSaving(true)
    await onAccept()
    setIsSaving(false)
  }

  const canProceed = termsChecked && privacyChecked

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: '#0f0f13' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div className="mb-6 flex items-center gap-2">
          <BloodDropIcon size={24} />
          <span className="text-sm tracking-[0.22em] text-white/90">GasoVet</span>
        </div>

        <h1 className="mb-2 text-xl font-bold text-white">Antes de continuar</h1>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Para usar o GasoVet, você precisa confirmar que leu e concordou com nossos documentos legais.
        </p>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              checked={termsChecked}
              className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
              type="checkbox"
              onChange={(e) => setTermsChecked(e.target.checked)}
            />
            <span className="text-sm text-white/80">
              Li e aceito os{' '}
              <a
                className="font-medium text-violet-400 underline hover:text-violet-300"
                href="/terms"
                rel="noopener noreferrer"
                target="_blank"
              >
                Termos de Uso
              </a>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              checked={privacyChecked}
              className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
              type="checkbox"
              onChange={(e) => setPrivacyChecked(e.target.checked)}
            />
            <span className="text-sm text-white/80">
              Li e aceito a{' '}
              <a
                className="font-medium text-violet-400 underline hover:text-violet-300"
                href="/privacy"
                rel="noopener noreferrer"
                target="_blank"
              >
                Política de Privacidade
              </a>
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
            disabled={!canProceed || isSaving}
            type="button"
            style={{ background: 'rgba(167,139,250,0.30)', border: '1px solid rgba(167,139,250,0.50)' }}
            onClick={() => void handleAccept()}
          >
            {isSaving ? 'Salvando...' : 'Confirmar e continuar'}
          </button>

          <button
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white/50 transition hover:text-white/80 active:scale-[0.98]"
            type="button"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            onClick={() => void onSignOut()}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
