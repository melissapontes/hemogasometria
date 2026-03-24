import { HamburgerMenu } from '../../../components/HamburgerMenu'
import { BloodDropIcon } from '../../../components/ui/BloodDropIcon'

type DashboardHeaderProps = {
  userEmail?: string
  onCreateAnimal: () => void
  onSignOut: () => Promise<void>
}

export function DashboardHeader({ userEmail, onCreateAnimal, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="mb-4 border-b border-white/20 pb-4 sm:mb-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BloodDropIcon size={28} />
            <p className="text-xs tracking-[0.22em] text-white/90">GasoVet</p>
          </div>
          <h1 className="text-[1.55rem] font-bold leading-tight text-white">Animais</h1>
          <p className="text-xs text-white/60">Usuário: {userEmail || 'Não identificado'}</p>
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
