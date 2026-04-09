import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui'

type AnimalCardProps = {
  id: string
  nome: string
  especie: string
  sexo: string | null
  idadeAnos: number | null
  onOpen: (animalId: string) => void
  onEdit: (animalId: string) => void
  onDelete: (animalId: string) => void
}

export function AnimalCard({ id, nome, especie, sexo, idadeAnos, onOpen, onEdit, onDelete }: AnimalCardProps) {
  return (
    <article className="rounded-3xl border border-violet-500 bg-white/75 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:bg-white/90">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight text-[#4d4d4d]">{nome}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-sm text-slate-700">Espécie: {especie}</p>
            <p className="text-sm text-slate-700">Sexo: {(sexo === 'Femea' ? 'Fêmea' : sexo) || 'Não informado'}</p>
            <p className="text-sm text-slate-700">Idade: {idadeAnos ? `${idadeAnos} ano(s)` : 'Não informada'}</p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            aria-label="Editar animal"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            type="button"
            onClick={() => onEdit(id)}
          >
            <Pencil size={15} />
          </button>
          <button
            aria-label="Excluir animal"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
            type="button"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <Button className="mt-4 w-full" type="button" variant="primary" onClick={() => onOpen(id)}>
        Analisar
      </Button>
    </article>
  )
}
