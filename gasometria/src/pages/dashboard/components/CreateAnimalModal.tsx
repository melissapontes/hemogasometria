import type { FormEvent } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '../../../components/ui'
import type { AnimalFormState, AnimalType } from '../../../types/animals'

type CreateAnimalModalProps = {
  form: AnimalFormState
  animalTypes: AnimalType[]
  isOpen: boolean
  isSaving: boolean
  editingAnimalId?: string | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFormChange: (field: keyof AnimalFormState, value: string) => void
}

export function CreateAnimalModal({
  form,
  animalTypes,
  isOpen,
  isSaving,
  editingAnimalId,
  onClose,
  onSubmit,
  onFormChange,
}: CreateAnimalModalProps) {
  const isEditing = Boolean(editingAnimalId)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(0,0,0,0.80), rgba(0,0,0,0.90))',
            "url('/species/cao.png')",
            "url('/species/gato.png')",
            "url('/species/cavalo.png')",
            "url('/species/boi.png')",
          ].join(', '),
          backgroundSize: '100% 100%, 50% 50%, 50% 50%, 50% 50%, 50% 50%',
          backgroundPosition: '0 0, 0 0, 100% 0, 0 100%, 100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar animal' : 'Cadastrar novo animal'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Altere os dados do paciente.' : 'Preencha os campos para criar a ficha do paciente.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField id="animal-nome" label="Nome *">
              <TextInput
                id="animal-nome"
                placeholder="Ex.: Thor"
                required
                value={form.nome}
                onChange={(event) => onFormChange('nome', event.target.value)}
              />
            </FormField>

            <FormField id="animal-especie" label="Espécie *">
              <SelectInput
                id="animal-especie"
                required
                value={form.animal_type_id}
                onChange={(event) => onFormChange('animal_type_id', event.target.value)}
              >
                <option value="">Selecione</option>
                {animalTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nome}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField id="animal-sexo" label="Sexo *">
              <SelectInput
                id="animal-sexo"
                required
                value={form.sexo}
                onChange={(event) => onFormChange('sexo', event.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Macho">Macho</option>
                <option value="Femea">Fêmea</option>
              </SelectInput>
            </FormField>

            <FormField id="animal-idade" label="Idade (anos)">
              <TextInput
                id="animal-idade"
                min={0}
                placeholder="Ex.: 3"
                step={1}
                type="number"
                value={form.idade_anos}
                onChange={(event) => onFormChange('idade_anos', event.target.value)}
              />
            </FormField>

            <FormField id="animal-peso" label="Peso (kg)">
              <TextInput
                id="animal-peso"
                min={0}
                placeholder="Ex.: 12.5"
                step={0.1}
                type="number"
                value={form.peso_kg}
                onChange={(event) => onFormChange('peso_kg', event.target.value)}
              />
            </FormField>

            <FormField className="md:col-span-2" id="animal-observacoes" label="Observacoes">
              <TextAreaInput
                id="animal-observacoes"
                placeholder="Informacoes clinicas relevantes..."
                value={form.observacoes}
                onChange={(event) => onFormChange('observacoes', event.target.value)}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button className="w-full sm:w-auto" disabled={isSaving} type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" disabled={isSaving} type="submit" variant="primary">
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar animal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
