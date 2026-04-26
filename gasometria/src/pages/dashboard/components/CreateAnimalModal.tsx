import type { FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui'
import type { SpeciesTheme } from '../../../lib/species-themes'
import type { AnimalFormState, AnimalType } from '../../../types/animals'

type CreateAnimalModalProps = {
  form: AnimalFormState
  animalTypes: AnimalType[]
  isOpen: boolean
  isSaving: boolean
  editingAnimalId?: string | null
  speciesTheme?: SpeciesTheme | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFormChange: (field: keyof AnimalFormState, value: string) => void
}

const COLLAGE_STYLE = {
  backgroundImage: [
    'linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.90))',
    "url('/species/cao.png')",
    "url('/species/gato.png')",
    "url('/species/cavalo.png')",
    "url('/species/boi.png')",
  ].join(', '),
  backgroundSize: '100% 100%, 50% 50%, 50% 50%, 50% 50%, 50% 50%',
  backgroundPosition: '0 0, 0 0, 100% 0, 0 100%, 100% 100%',
  backgroundRepeat: 'no-repeat' as const,
}

export function CreateAnimalModal({
  form,
  animalTypes,
  isOpen,
  isSaving,
  editingAnimalId,
  speciesTheme,
  onClose,
  onSubmit,
  onFormChange,
}: CreateAnimalModalProps) {
  const isEditing = Boolean(editingAnimalId)
  const accent = speciesTheme?.accent ?? '#a78bfa'
  const isSpeciesLocked = Boolean(speciesTheme && !isEditing)

  const bgStyle = speciesTheme?.image
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.88)), url('${speciesTheme.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 25%',
        backgroundRepeat: 'no-repeat' as const,
      }
    : COLLAGE_STYLE

  const inputCls = 'w-full rounded-xl border bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none focus:ring-2 backdrop-blur-sm'
  const inputStyle = { borderColor: `${accent}50` }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={bgStyle}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? 'Editar animal' : 'Cadastrar novo animal'}
          </DialogTitle>
          {isSpeciesLocked && speciesTheme && (
            <p className="mt-1 text-base font-medium" style={{ color: accent }}>
              Espécie: {speciesTheme.subtitle.replace('Espécie ', '')}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Nome */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-nome">
                Nome *
              </label>
              <input
                className={inputCls}
                id="animal-nome"
                placeholder="Ex.: Thor"
                required
                style={inputStyle}
                type="text"
                value={form.nome}
                onChange={(e) => onFormChange('nome', e.target.value)}
              />
            </div>

            {/* Espécie — só mostra se não estiver travada */}
            {!isSpeciesLocked && (
              <div>
                <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-especie">
                  Espécie *
                </label>
                <select
                  className={inputCls}
                  id="animal-especie"
                  required
                  style={inputStyle}
                  value={form.animal_type_id}
                  onChange={(e) => onFormChange('animal_type_id', e.target.value)}
                >
                  <option value="" className="bg-[#2a2a2e] text-white">Selecione</option>
                  {animalTypes.map((type) => (
                    <option key={type.id} value={type.id} className="bg-[#2a2a2e] text-white">
                      {type.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sexo */}
            <div>
              <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-sexo">
                Sexo *
              </label>
              <select
                className={inputCls}
                id="animal-sexo"
                required
                style={inputStyle}
                value={form.sexo}
                onChange={(e) => onFormChange('sexo', e.target.value)}
              >
                <option value="" className="bg-[#2a2a2e] text-white">Selecione</option>
                <option value="Macho" className="bg-[#2a2a2e] text-white">Macho</option>
                <option value="Femea" className="bg-[#2a2a2e] text-white">Fêmea</option>
              </select>
            </div>

            {/* Idade */}
            <div>
              <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-idade">
                Idade (anos)
              </label>
              <input
                className={inputCls}
                id="animal-idade"
                min={0}
                placeholder="Ex.: 3"
                step={1}
                style={inputStyle}
                type="number"
                value={form.idade_anos}
                onChange={(e) => onFormChange('idade_anos', e.target.value)}
              />
            </div>

            {/* Peso */}
            <div>
              <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-peso">
                Peso (kg)
              </label>
              <input
                className={inputCls}
                id="animal-peso"
                min={0}
                placeholder="Ex.: 12.5"
                step={0.1}
                style={inputStyle}
                type="number"
                value={form.peso_kg}
                onChange={(e) => onFormChange('peso_kg', e.target.value)}
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-base font-semibold text-white" htmlFor="animal-observacoes">
                Observações
              </label>
              <textarea
                className={inputCls}
                id="animal-observacoes"
                placeholder="Informações clínicas relevantes..."
                rows={3}
                style={inputStyle}
                value={form.observacoes}
                onChange={(e) => onFormChange('observacoes', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <button
              className="w-full rounded-2xl py-3 text-base font-semibold text-white/70 transition hover:text-white sm:w-auto sm:px-6"
              disabled={isSaving}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="w-full rounded-2xl py-3 text-base font-bold text-white transition active:scale-[0.98] sm:w-auto sm:px-8"
              disabled={isSaving}
              style={{ background: `${accent}40`, border: `1px solid ${accent}60` }}
              type="submit"
            >
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar animal'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
