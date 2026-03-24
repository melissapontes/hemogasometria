import { Button } from '../../../components/ui'
import { BloodDropIcon } from '../../../components/ui/BloodDropIcon'

type DashboardHeaderProps = {
  userEmail?: string
  onCreateAnimal: () => void
  onSignOut: () => Promise<void>
}

export function DashboardHeader({ userEmail, onCreateAnimal, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="mb-4 border-b border-slate-200/80 pb-4 sm:mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BloodDropIcon size={28} />
            <p className="text-xs tracking-[0.22em]" style={{ color: '#39484f' }}>GasoVet</p>
          </div>
          <h1 className="text-[1.55rem] font-bold leading-tight text-[#4d4d4d]">Animais</h1>
          <p className="text-xs text-slate-500">Usuário: {userEmail || 'Não identificado'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button className="w-full sm:w-auto" type="button" variant="primary" onClick={onCreateAnimal}>
            Novo animal
          </Button>
          <Button className="w-full sm:w-auto" type="button" onClick={() => void onSignOut()}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
