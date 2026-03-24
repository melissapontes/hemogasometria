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
        <p className="text-lg font-bold leading-tight text-[#4d4d4d]">{nome}</p>
        <div className="mt-1 space-y-0.5">
          <p className="text-sm text-slate-500">Espécie: {especie}</p>
          <p className="text-sm text-slate-500">Sexo: {(sexo === 'Femea' ? 'Fêmea' : sexo) || 'Não informado'}</p>
          <p className="text-sm text-slate-500">Idade: {idadeAnos ? `${idadeAnos} ano(s)` : 'Não informada'}</p>
        </div>
      </div>

      <Button className="mt-4 w-full" type="button" variant="primary" onClick={() => onOpen(id)}>
        Analisar
      </Button>
    </article>
  )
}
