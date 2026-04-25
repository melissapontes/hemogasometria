import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { AlertMessage, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, PageContainer } from '../../components/ui'
import { getAnimalTypeName, isAnimalsLegacySchemaError, normalizeAnimal } from '../../lib/animal-utils'
import { getSpeciesTheme } from '../../lib/species-themes'
import { supabase } from '../../lib/supabase'
import { AnimalCard } from './components/AnimalCard'
import { CreateAnimalModal } from './components/CreateAnimalModal'
import { DashboardHeader } from './components/DashboardHeader'
import type { Animal, AnimalFormState, AnimalType } from '../../types/animals'
import { initialAnimalFormState } from '../../types/animals'

type AnimalWithSpecies = Animal & {
  especie: string
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { typeId } = useParams<{ typeId: string }>()

  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<AnimalFormState>(initialAnimalFormState)
  const [isLegacySchema, setIsLegacySchema] = useState(false)
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null)
  const [deletingAnimal, setDeletingAnimal] = useState<AnimalWithSpecies | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedType = useMemo(
    () => animalTypes.find((t) => String(t.id) === typeId) ?? null,
    [animalTypes, typeId],
  )

  const speciesTheme = getSpeciesTheme(typeId)

  const formattedAnimals = useMemo<AnimalWithSpecies[]>(() => {
    return animals
      .filter((a) => !typeId || String(a.animal_type_id) === typeId)
      .map((animal) => ({
        ...animal,
        especie: getAnimalTypeName(animal.animal_types),
      }))
  }, [animals, typeId])

  useEffect(() => {
    void loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setIsLoading(true)
    setErrorMessage(null)

    const [animalsResult, typesResult] = await Promise.all([
      supabase
        .from('animals')
        .select(
          'id, nome, animal_type_id, sexo, idade_anos, peso_kg, observacoes, created_at, animal_types(nome)',
        )
        .order('created_at', { ascending: false }),
      supabase.from('animal_types').select('id, nome').order('nome', { ascending: true }),
    ])

    if (animalsResult.error) {
      if (isAnimalsLegacySchemaError(animalsResult.error.message)) {
        const fallbackAnimals = await supabase
          .from('animals')
          .select('id, nome, animal_type_id, created_at, animal_types(nome)')
          .order('created_at', { ascending: false })

        if (fallbackAnimals.error) {
          setErrorMessage(fallbackAnimals.error.message)
        } else {
          setAnimals((fallbackAnimals.data ?? []).map((item) => normalizeAnimal(item as Animal)))
          setIsLegacySchema(true)
          setErrorMessage(
            'Banco desatualizado: aplique as migrações novas para salvar sexo, idade, peso e observações.',
          )
        }
      } else {
        setErrorMessage(animalsResult.error.message)
      }
    } else {
      setAnimals((animalsResult.data ?? []).map((item) => normalizeAnimal(item as Animal)))
      setIsLegacySchema(false)
    }

    if (typesResult.error) {
      setErrorMessage(typesResult.error.message)
    } else {
      setAnimalTypes(typesResult.data ?? [])
    }

    setIsLoading(false)
  }

  function openModal() {
    setForm(initialAnimalFormState)
    setEditingAnimalId(null)
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function openEditModal(animalId: string) {
    const animal = animals.find((a) => a.id === animalId)
    if (!animal) return
    setForm({
      nome: animal.nome,
      animal_type_id: animal.animal_type_id ? String(animal.animal_type_id) : '',
      sexo: animal.sexo ?? '',
      idade_anos: animal.idade_anos != null ? String(animal.idade_anos) : '',
      peso_kg: animal.peso_kg != null ? String(animal.peso_kg) : '',
      observacoes: animal.observacoes ?? '',
    })
    setEditingAnimalId(animalId)
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingAnimalId(null)
  }

  function handleFormChange(field: keyof AnimalFormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleCreateAnimal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setErrorMessage('Usuário não autenticado.')
      return
    }

    if (!form.nome.trim() || !form.animal_type_id) {
      setErrorMessage('Preencha nome e espécie para cadastrar o animal.')
      return
    }

    if (!form.sexo) {
      setErrorMessage('Selecione o sexo do animal.')
      return
    }

    if (isLegacySchema) {
      setErrorMessage(
        'Não foi possível salvar: o banco ainda não tem os campos novos. Rode as migrações do Supabase e tente novamente.',
      )
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    const idadeAnos = form.idade_anos ? Number(form.idade_anos) : null
    const pesoKg = form.peso_kg ? Number(form.peso_kg) : null
    const payload = {
      nome: form.nome.trim(),
      animal_type_id: Number(form.animal_type_id),
      sexo: form.sexo.trim() || null,
      idade_anos: Number.isNaN(idadeAnos) ? null : idadeAnos,
      peso_kg: Number.isNaN(pesoKg) ? null : pesoKg,
      observacoes: form.observacoes.trim() || null,
    }

    let error
    if (editingAnimalId) {
      const result = await supabase.from('animals').update(payload).eq('id', editingAnimalId)
      error = result.error
    } else {
      const result = await supabase.from('animals').insert({ ...payload, user_id: user.id })
      error = result.error
    }

    if (error) {
      setErrorMessage(error.message)
      setIsSaving(false)
      return
    }

    await loadDashboardData()
    setIsSaving(false)
    setIsModalOpen(false)
    setEditingAnimalId(null)
  }

  async function handleDeleteAnimal() {
    if (!deletingAnimal) return
    setIsDeleting(true)

    const { error } = await supabase.from('animals').delete().eq('id', deletingAnimal.id)

    if (error) {
      setErrorMessage(error.message)
    } else {
      await loadDashboardData()
    }

    setIsDeleting(false)
    setDeletingAnimal(null)
  }

  return (
    <PageContainer maxWidthClassName="max-w-5xl" style={speciesTheme ? { background: speciesTheme.bg } : undefined}>
      <DashboardHeader
        accentColor={speciesTheme?.accent ?? null}
        userEmail={user?.email}
        speciesName={selectedType?.nome ?? null}
        onCreateAnimal={openModal}
        onSignOut={signOut}
        onBack={() => navigate('/dashboard')}
      />

      {errorMessage ? <AlertMessage message={errorMessage} /> : null}

      {isLoading ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
          Carregando animais...
        </div>
      ) : null}

      {!isLoading && formattedAnimals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300/90 bg-white/55 p-5 text-sm text-slate-600">
          <p>Nenhum {selectedType?.nome.toLowerCase() ?? 'animal'} cadastrado ainda.</p>
          <p className="mt-1">Toque em "Novo animal" para criar o primeiro cadastro.</p>
          <Button className="mt-4 w-full sm:w-auto" type="button" variant="primary" onClick={openModal}>
            Cadastrar primeiro animal
          </Button>
        </section>
      ) : null}

      {!isLoading && formattedAnimals.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {formattedAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              accentColor={speciesTheme?.accent ?? null}
              id={animal.id}
              idadeAnos={animal.idade_anos}
              especie={animal.especie}
              nome={animal.nome}
              sexo={animal.sexo}
              onOpen={(animalId) => navigate(`/animals/${animalId}`)}
              onEdit={openEditModal}
              onDelete={(animalId) => {
                const found = formattedAnimals.find((a) => a.id === animalId)
                if (found) setDeletingAnimal(found)
              }}
            />
          ))}
        </div>
      ) : null}

      <CreateAnimalModal
        animalTypes={animalTypes}
        editingAnimalId={editingAnimalId}
        form={form}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={closeModal}
        onFormChange={handleFormChange}
        onSubmit={handleCreateAnimal}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deletingAnimal)} onOpenChange={(open) => { if (!open && !isDeleting) setDeletingAnimal(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir animal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/80">
            Tem certeza que deseja excluir <span className="font-semibold text-white">{deletingAnimal?.nome}</span>? Esta ação não pode ser desfeita e todos os exames do animal serão perdidos.
          </p>
          <DialogFooter>
            <Button className="w-full sm:w-auto" disabled={isDeleting} type="button" onClick={() => setDeletingAnimal(null)}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto border-0 bg-red-500 text-white hover:bg-red-600"
              disabled={isDeleting}
              type="button"
              onClick={() => void handleDeleteAnimal()}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
