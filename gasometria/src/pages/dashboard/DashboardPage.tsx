import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { AlertMessage, Button, PageContainer } from '../../components/ui'
import { getAnimalTypeName, isAnimalsLegacySchemaError, normalizeAnimal } from '../../lib/animal-utils'
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

  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<AnimalFormState>(initialAnimalFormState)
  const [isLegacySchema, setIsLegacySchema] = useState(false)

  const formattedAnimals = useMemo<AnimalWithSpecies[]>(() => {
    return animals.map((animal) => ({
      ...animal,
      especie: getAnimalTypeName(animal.animal_types),
    }))
  }, [animals])

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
            'Banco desatualizado: aplique as migracoes novas para salvar sexo, idade, peso e observacoes.',
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
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSaving) {
      return
    }

    setIsModalOpen(false)
  }

  function handleFormChange(field: keyof AnimalFormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleCreateAnimal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setErrorMessage('Usuario nao autenticado.')
      return
    }

    if (!form.nome.trim() || !form.animal_type_id) {
      setErrorMessage('Preencha nome e especie para cadastrar o animal.')
      return
    }

    if (!form.sexo) {
      setErrorMessage('Selecione o sexo do animal.')
      return
    }

    if (isLegacySchema) {
      setErrorMessage(
        'Nao foi possivel salvar: o banco ainda nao tem os campos novos. Rode as migracoes do Supabase e tente novamente.',
      )
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    const idadeAnos = form.idade_anos ? Number(form.idade_anos) : null
    const pesoKg = form.peso_kg ? Number(form.peso_kg) : null

    const { error } = await supabase.from('animals').insert({
      nome: form.nome.trim(),
      animal_type_id: Number(form.animal_type_id),
      sexo: form.sexo.trim() || null,
      idade_anos: Number.isNaN(idadeAnos) ? null : idadeAnos,
      peso_kg: Number.isNaN(pesoKg) ? null : pesoKg,
      observacoes: form.observacoes.trim() || null,
      user_id: user.id,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSaving(false)
      return
    }

    await loadDashboardData()
    setIsSaving(false)
    setIsModalOpen(false)
  }

  return (
    <PageContainer maxWidthClassName="max-w-5xl">
      <DashboardHeader userEmail={user?.email} onCreateAnimal={openModal} onSignOut={signOut} />

      {errorMessage ? <AlertMessage message={errorMessage} /> : null}

      {isLoading ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
          Carregando animais...
        </div>
      ) : null}

      {!isLoading && formattedAnimals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300/90 bg-white/55 p-5 text-sm text-slate-600">
          <p>Nenhum animal cadastrado ainda.</p>
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
              id={animal.id}
              idadeAnos={animal.idade_anos}
              especie={animal.especie}
              nome={animal.nome}
              sexo={animal.sexo}
              onOpen={(animalId) => navigate(`/animals/${animalId}`)}
            />
          ))}
        </div>
      ) : null}

      <CreateAnimalModal
        animalTypes={animalTypes}
        form={form}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={closeModal}
        onFormChange={handleFormChange}
        onSubmit={handleCreateAnimal}
      />
    </PageContainer>
  )
}

