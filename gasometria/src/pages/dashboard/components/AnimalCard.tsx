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
    <article className="rounded-3xl border border-slate-200/90 bg-white/75 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:bg-white/90">
      <div>
        <p className="text-lg font-bold leading-tight text-slate-900">{nome}</p>
        <p className="mt-1 text-sm text-slate-500">Especie: {especie}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
          Sexo: {sexo || 'Nao informado'}
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          Idade: {idadeAnos ? `${idadeAnos} ano(s)` : 'Nao informada'}
        </span>
      </div>

      <Button className="mt-4 w-full" type="button" variant="primary" onClick={() => onOpen(id)}>
        Abrir ficha
      </Button>
    </article>
  )
}
