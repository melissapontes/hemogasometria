import { ArrowLeft } from 'lucide-react'
import { HamburgerMenu } from '../../../components/HamburgerMenu'
import { BloodDropIcon } from '../../../components/ui/BloodDropIcon'

type DashboardHeaderProps = {
  userEmail?: string
  speciesName: string | null
  onCreateAnimal: () => void
  onSignOut: () => Promise<void>
  onBack: () => void
}

export function DashboardHeader({ userEmail, speciesName, onCreateAnimal, onSignOut, onBack }: DashboardHeaderProps) {
  return (
    <header className="mb-4 border-b border-white/20 pb-4 sm:mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Voltar para seleção de espécie"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BloodDropIcon size={22} />
              <p className="text-xs tracking-[0.22em] text-white/90">GasoVet</p>
            </div>
            <h1 className="text-[1.55rem] font-bold leading-tight text-white">
              {speciesName ?? 'Animais'}
            </h1>
            <p className="text-xs text-white/60">Usuário: {userEmail || 'Não identificado'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 active:scale-[0.99]"
            type="button"
            onClick={onCreateAnimal}
          >
            Novo animal
          </button>
          <HamburgerMenu onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  )
}
