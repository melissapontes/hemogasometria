import { Button } from '../../../components/ui'

type AnimalCardProps = {
  id: string
  nome: string
  especie: string
  sexo: string | null
  idadeAnos: number | null
  onOpen: (animalId: string) => void
}

export function AnimalCard({ id, nome, especie, sexo, idadeAnos, onOpen }: AnimalCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <p className="text-lg font-bold text-slate-900">{nome}</p>
        <p className="text-sm text-slate-500">Especie: {especie}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
          Sexo: {sexo || 'Nao informado'}
        </span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Idade: {idadeAnos ? `${idadeAnos} ano(s)` : 'Nao informada'}
        </span>
      </div>

      <Button className="mt-4" type="button" variant="primary" onClick={() => onOpen(id)}>
        Abrir ficha
      </Button>
    </article>
  )
}
