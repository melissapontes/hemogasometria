import { Button } from '../../../components/ui'

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
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Painel Clinico</p>
          <h1 className="text-[1.55rem] font-bold leading-tight text-slate-900">Animais</h1>
          <p className="text-xs text-slate-500">Usuario: {userEmail || 'Nao identificado'}</p>
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
