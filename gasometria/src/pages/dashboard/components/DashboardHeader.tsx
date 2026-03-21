import { Button } from '../../../components/ui'

type DashboardHeaderProps = {
  userEmail?: string
  onCreateAnimal: () => void
  onSignOut: () => Promise<void>
}

export function DashboardHeader({ userEmail, onCreateAnimal, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Painel Clinico</p>
        <h1 className="text-2xl font-bold text-slate-900">Animais</h1>
        <p className="text-xs text-slate-500">Usuario logado: {userEmail || 'Nao identificado'}</p>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="primary" onClick={onCreateAnimal}>
          Novo animal
        </Button>
        <Button type="button" onClick={() => void onSignOut()}>
          Sair
        </Button>
      </div>
    </header>
  )
}
