import { Pencil, Trash2 } from 'lucide-react'

type AnimalCardProps = {
  accentColor: string | null
  id: string
  nome: string
  especie: string
  sexo: string | null
  idadeAnos: number | null
  onOpen: (animalId: string) => void
  onEdit: (animalId: string) => void
  onDelete: (animalId: string) => void
}

export function AnimalCard({ accentColor, id, nome, especie, sexo, idadeAnos, onOpen, onEdit, onDelete }: AnimalCardProps) {
  const accent = accentColor ?? '#06b6d4'

  return (
    <article
      className="rounded-3xl p-4 shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${accent}50`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight text-white">{nome}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-sm text-white/70">Espécie: {especie}</p>
            <p className="text-sm text-white/70">Sexo: {(sexo === 'Femea' ? 'Fêmea' : sexo) || 'Não informado'}</p>
            <p className="text-sm text-white/70">Idade: {idadeAnos ? `${idadeAnos} ano(s)` : 'Não informada'}</p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            aria-label="Editar animal"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-white/10 hover:text-white/80"
            type="button"
            onClick={() => onEdit(id)}
          >
            <Pencil size={15} />
          </button>
          <button
            aria-label="Excluir animal"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-red-500/20 hover:text-red-400"
            type="button"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-2xl py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        type="button"
        onClick={() => onOpen(id)}
        style={{
          background: `${accent}40`,
          border: `1px solid ${accent}50`,
        }}
      >
        Analisar
      </button>
    </article>
  )
}
