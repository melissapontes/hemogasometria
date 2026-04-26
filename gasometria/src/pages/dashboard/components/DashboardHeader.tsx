import { ArrowLeft } from 'lucide-react'
import { HamburgerMenu } from '../../../components/HamburgerMenu'
import { BloodDropIcon } from '../../../components/ui/BloodDropIcon'

type DashboardHeaderProps = {
  accentColor: string | null
  speciesName: string | null
  onCreateAnimal: () => void
  onSignOut: () => Promise<void>
  onBack: () => void
}

export function DashboardHeader({ accentColor, speciesName, onCreateAnimal, onSignOut, onBack }: DashboardHeaderProps) {
  const accent = accentColor ?? '#06b6d4'

  return (
    <header
      className="mb-4 border-b pb-4 sm:mb-5"
      style={{ borderColor: `${accent}40` }}
    >
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
              {speciesName ? `Espécie ${speciesName}` : 'Animais'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.99]"
            type="button"
            onClick={onCreateAnimal}
            style={{
              background: `${accent}30`,
              border: `1px solid ${accent}40`,
            }}
          >
            Novo animal
          </button>
          <HamburgerMenu onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  )
}
