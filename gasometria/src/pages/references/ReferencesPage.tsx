import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'

type Reference = {
  id: string
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
  content: React.ReactNode
}

const REFERENCES: Reference[] = [
  {
    id: 'anion-gap',
    title: 'A Quick Reference on Anion Gap and Strong Ion Gap',
    authors: 'Torrente Artero C.',
    journal: 'Vet Clin Small Anim',
    year: 2016,
    doi: 'https://doi.org/10.1016/j.cvsm.2016.10.006',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Fórmula do Ânion Gap</h4>
          <div className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700">
            AG = (Na⁺ + K⁺) − (Cl⁻ + HCO₃⁻)
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Valores de referência</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-3 py-2 font-semibold text-slate-600">Espécie</th>
                  <th className="px-3 py-2 font-semibold text-slate-600">AG normal</th>
                  <th className="px-3 py-2 font-semibold text-slate-600">SIG normal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-3 py-2">Cão</td><td className="px-3 py-2">12–24 mEq/L</td><td className="px-3 py-2">−5 a +5 mEq/L</td></tr>
                <tr><td className="px-3 py-2">Gato</td><td className="px-3 py-2">13–27 mEq/L</td><td className="px-3 py-2">−5 a +5 mEq/L</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Interpretação clínica</h4>
          <div className="space-y-2">
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-red-700">AG elevado (normoclorêmico)</p>
              <p className="mt-0.5 text-xs text-slate-600">Acidose orgânica: acidose lática, cetoacidose diabética, uremia, intoxicação por etilenoglicol, salicilatos ou paraldeído</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-emerald-700">AG normal (hiperclorêmico)</p>
              <p className="mt-0.5 text-xs text-slate-600">Diarreia, hipoadrenocorticismo, acidose dilucional, acidose tubular renal, acidose pós-hipocápnica</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-amber-700">AG baixo</p>
              <p className="mt-0.5 text-xs text-slate-600">Quase sempre associado a hipoalbuminemia. Considerar correção pela albumina.</p>
            </div>
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Correção pela albumina e fósforo</h4>
          <div className="space-y-1.5">
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-700">
              <span className="text-slate-400">Cão: </span>AG<sub>alb</sub> = AG + 0,42 × (3,77 − [Alb])
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-700">
              <span className="text-slate-400">Gato: </span>AG<sub>alb</sub> = AG + 0,41 × (3,3 − [Alb])
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-700">
              <span className="text-slate-400">Fósforo: </span>AG<sub>fos</sub> = AG + (2,52 − 0,58 × [Pi])
            </div>
            <p className="pl-1 text-[11px] text-slate-400">Alb em g/dL · Pi (fósforo inorgânico) em mg/dL</p>
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Strong Ion Gap (SIG)</h4>
          <div className="space-y-1.5">
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-700">
              <span className="text-slate-400">Cão: </span>SIG = (Alb × 4,9) − AG
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-700">
              <span className="text-slate-400">Gato: </span>SIG = (Alb × 7,4) − AG
            </div>
            <p className="pl-1 text-[11px] text-slate-400">Em hiperfosfatemia, ajustar o AG pelo fósforo antes de calcular o SIG. SIG negativo = ânions fortes não mensurados presentes.</p>
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-semibold text-[#36494f]">Fatores que interferem</h4>
          <ul className="ml-4 list-disc space-y-1 text-xs text-slate-600">
            <li><strong>Hipoalbuminemia:</strong> diminui o AG — pode mascarar acidose grave</li>
            <li><strong>Hiperfosfatemia:</strong> aumenta o AG independentemente de ânions não mensurados</li>
            <li><strong>Desidratação grave:</strong> pode aumentar albumina sérica e o AG</li>
            <li><strong>Brometo de potássio:</strong> lido como cloro por muitos analisadores — reduz AG e SIG artificialmente</li>
            <li><strong>Alcalemia:</strong> pode aumentar levemente o AG</li>
          </ul>
        </section>
      </div>
    ),
  },
]

export function ReferencesPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh bg-[#0f0f13] px-3 pb-12 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            aria-label="Voltar"
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-white hover:bg-white/20"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BloodDropIcon size={24} />
            <span className="text-sm tracking-[0.22em] text-white/90">GasoVet</span>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Referências Bibliográficas</h1>
        <p className="mb-6 text-sm text-white/60">{REFERENCES.length} artigo{REFERENCES.length !== 1 ? 's' : ''} disponível{REFERENCES.length !== 1 ? 'is' : ''}</p>

        {/* Index */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Índice</p>
          <ol className="space-y-1">
            {REFERENCES.map((ref, i) => (
              <li key={ref.id}>
                <a
                  className="text-sm text-white/80 hover:text-white hover:underline"
                  href={`#${ref.id}`}
                >
                  {i + 1}. {ref.authors} ({ref.year}) — {ref.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Articles */}
        <div className="space-y-6">
          {REFERENCES.map((ref, i) => (
            <article key={ref.id} id={ref.id} className="rounded-3xl border border-white/10 bg-white/90 p-6 sm:p-8">
              <div className="mb-5 flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#36494f]/10">
                  <BookOpen size={18} className="text-[#36494f]" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Referência {i + 1}
                  </p>
                  <h2 className="text-base font-bold leading-snug text-[#36494f]">{ref.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {ref.authors} · <em>{ref.journal}</em>, {ref.year}
                    {ref.doi ? (
                      <>
                        {' · '}
                        <a
                          className="text-cyan-700 underline hover:text-cyan-900"
                          href={ref.doi}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          DOI
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              {ref.content}
            </article>
          ))}
        </div>

      </div>
    </main>
  )
}
