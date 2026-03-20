import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { AlertMessage, Button, PageContainer } from '../../components/ui'
import { getAnimalTypeName, isAnimalsLegacySchemaError, normalizeAnimal } from '../../lib/animal-utils'
import { supabase } from '../../lib/supabase'
import type { Animal } from '../../types/animals'
import { AnimalInfoItem } from './components/AnimalInfoItem'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

type ExtractedExamValues = {
  ph: number | null
  pco2: number | null
  po2: number | null
  be: number | null
  hco3: number | null
  tco2: number | null
  so2: number | null
  na: number | null
  k: number | null
  ica: number | null
  glicose: number | null
  hematocrito: number | null
  hemoglobina: number | null
  temperatura: number | null
  cloro: number | null
}

type ExtractedExamValueKey = keyof ExtractedExamValues
type ExtractedExamDraftValues = Record<ExtractedExamValueKey, string>

type ReferenceRange = {
  raw: string | null
  min: number | null
  max: number | null
}

type ExtractedExamReferences = Record<ExtractedExamValueKey, ReferenceRange>
type ExamCardTab = 'extracoes' | 'calculos'

type LatestExamRecord = {
  extractedValues: ExtractedExamValues
  extractedReferences: ExtractedExamReferences
  updatedAt: string
  sourceFileName: string | null
}

const EMPTY_EXTRACTED_VALUES: ExtractedExamValues = {
  ph: null,
  pco2: null,
  po2: null,
  be: null,
  hco3: null,
  tco2: null,
  so2: null,
  na: null,
  k: null,
  ica: null,
  glicose: null,
  hematocrito: null,
  hemoglobina: null,
  temperatura: null,
  cloro: null,
}

const EMPTY_REFERENCE_RANGE: ReferenceRange = {
  raw: null,
  min: null,
  max: null,
}

const EMPTY_EXTRACTED_REFERENCES: ExtractedExamReferences = {
  ph: { ...EMPTY_REFERENCE_RANGE },
  pco2: { ...EMPTY_REFERENCE_RANGE },
  po2: { ...EMPTY_REFERENCE_RANGE },
  be: { ...EMPTY_REFERENCE_RANGE },
  hco3: { ...EMPTY_REFERENCE_RANGE },
  tco2: { ...EMPTY_REFERENCE_RANGE },
  so2: { ...EMPTY_REFERENCE_RANGE },
  na: { ...EMPTY_REFERENCE_RANGE },
  k: { ...EMPTY_REFERENCE_RANGE },
  ica: { ...EMPTY_REFERENCE_RANGE },
  glicose: { ...EMPTY_REFERENCE_RANGE },
  hematocrito: { ...EMPTY_REFERENCE_RANGE },
  hemoglobina: { ...EMPTY_REFERENCE_RANGE },
  temperatura: { ...EMPTY_REFERENCE_RANGE },
  cloro: { ...EMPTY_REFERENCE_RANGE },
}

const EXAM_PARAMETER_FIELDS: Array<{ key: ExtractedExamValueKey; label: string }> = [
  { key: 'ph', label: 'pH' },
  { key: 'pco2', label: 'pCO2' },
  { key: 'po2', label: 'pO2' },
  { key: 'be', label: 'BE' },
  { key: 'hco3', label: 'HCO3' },
  { key: 'tco2', label: 'tCO2' },
  { key: 'so2', label: 'sO2' },
  { key: 'na', label: 'Sodio (Na)' },
  { key: 'k', label: 'Potassio (K)' },
  { key: 'ica', label: 'iCa' },
  { key: 'glicose', label: 'Glicose' },
  { key: 'hematocrito', label: 'Hematocrito' },
  { key: 'hemoglobina', label: 'Hemoglobina' },
  { key: 'temperatura', label: 'Temperatura' },
  { key: 'cloro', label: 'Cloro (Cl)' },
]

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toDraftValue(value: number | null): string {
  return value === null ? '' : String(value)
}

function buildDraftValues(values: ExtractedExamValues): ExtractedExamDraftValues {
  return {
    ph: toDraftValue(values.ph),
    pco2: toDraftValue(values.pco2),
    po2: toDraftValue(values.po2),
    be: toDraftValue(values.be),
    hco3: toDraftValue(values.hco3),
    tco2: toDraftValue(values.tco2),
    so2: toDraftValue(values.so2),
    na: toDraftValue(values.na),
    k: toDraftValue(values.k),
    ica: toDraftValue(values.ica),
    glicose: toDraftValue(values.glicose),
    hematocrito: toDraftValue(values.hematocrito),
    hemoglobina: toDraftValue(values.hemoglobina),
    temperatura: toDraftValue(values.temperatura),
    cloro: toDraftValue(values.cloro),
  }
}

function parseDraftNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDraftValues(draft: ExtractedExamDraftValues): {
  values: ExtractedExamValues
  invalidFields: string[]
} {
  const parsedValues = { ...EMPTY_EXTRACTED_VALUES }
  const invalidFields: string[] = []

  EXAM_PARAMETER_FIELDS.forEach((field) => {
    const draftValue = draft[field.key]
    const parsed = parseDraftNumber(draftValue)

    if (draftValue.trim() !== '' && parsed === null) {
      invalidFields.push(field.label)
      return
    }

    parsedValues[field.key] = parsed
  })

  return {
    values: parsedValues,
    invalidFields,
  }
}

function normalizeExtractedValues(raw: unknown): ExtractedExamValues {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}

  return {
    ph: normalizeNumber(input.ph),
    pco2: normalizeNumber(input.pco2),
    po2: normalizeNumber(input.po2),
    be: normalizeNumber(input.be),
    hco3: normalizeNumber(input.hco3),
    tco2: normalizeNumber(input.tco2),
    so2: normalizeNumber(input.so2),
    na: normalizeNumber(input.na),
    k: normalizeNumber(input.k),
    ica: normalizeNumber(input.ica),
    glicose: normalizeNumber(input.glicose),
    hematocrito: normalizeNumber(input.hematocrito),
    hemoglobina: normalizeNumber(input.hemoglobina),
    temperatura: normalizeNumber(input.temperatura),
    cloro: normalizeNumber(input.cloro),
  }
}

function normalizeReferenceRange(raw: unknown): ReferenceRange {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const rawValue = typeof input.raw === 'string' ? input.raw.trim() : ''

  return {
    raw: rawValue || null,
    min: normalizeNumber(input.min),
    max: normalizeNumber(input.max),
  }
}

function normalizeExtractedReferences(raw: unknown): ExtractedExamReferences {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}

  return {
    ph: normalizeReferenceRange(input.ph),
    pco2: normalizeReferenceRange(input.pco2),
    po2: normalizeReferenceRange(input.po2),
    be: normalizeReferenceRange(input.be),
    hco3: normalizeReferenceRange(input.hco3),
    tco2: normalizeReferenceRange(input.tco2),
    so2: normalizeReferenceRange(input.so2),
    na: normalizeReferenceRange(input.na),
    k: normalizeReferenceRange(input.k),
    ica: normalizeReferenceRange(input.ica),
    glicose: normalizeReferenceRange(input.glicose),
    hematocrito: normalizeReferenceRange(input.hematocrito),
    hemoglobina: normalizeReferenceRange(input.hemoglobina),
    temperatura: normalizeReferenceRange(input.temperatura),
    cloro: normalizeReferenceRange(input.cloro),
  }
}

function normalizeExamPayload(raw: unknown): {
  values: ExtractedExamValues
  references: ExtractedExamReferences
} {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const extractedSource = typeof input.extracted !== 'undefined' ? input.extracted : input
  const referencesSource = input.references

  return {
    values: normalizeExtractedValues(extractedSource),
    references: normalizeExtractedReferences(referencesSource),
  }
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('pt-BR')
}

function formatExamValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatReferenceValue(reference: ReferenceRange): string {
  if (reference.raw) {
    return reference.raw
  }

  if (reference.min !== null && reference.max !== null) {
    return `${formatExamValue(reference.min)}-${formatExamValue(reference.max)}`
  }

  if (reference.min !== null) {
    return `>= ${formatExamValue(reference.min)}`
  }

  if (reference.max !== null) {
    return `<= ${formatExamValue(reference.max)}`
  }

  return 'Nao encontrado'
}

function resolveReferenceBounds(reference: ReferenceRange): { min: number | null; max: number | null } {
  if (reference.min !== null || reference.max !== null) {
    return { min: reference.min, max: reference.max }
  }

  if (!reference.raw) {
    return { min: null, max: null }
  }

  const normalized = reference.raw.replace(',', '.').replace(/\s/g, '')
  const intervalMatch = normalized.match(/(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/)

  if (!intervalMatch) {
    return { min: null, max: null }
  }

  const min = Number(intervalMatch[1])
  const max = Number(intervalMatch[2])

  return {
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
  }
}

function normalizeAnimalTypeName(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

type CorrectedChlorideFormula = {
  speciesLabel: string
  divisor: number
}

function getCorrectedChlorideFormula(animalTypeName: string | null): CorrectedChlorideFormula | null {
  if (!animalTypeName) {
    return null
  }

  const normalizedName = normalizeAnimalTypeName(animalTypeName)

  if (normalizedName === 'cao') {
    return { speciesLabel: 'Cao', divisor: 146 }
  }

  if (normalizedName === 'gato') {
    return { speciesLabel: 'Gato', divisor: 156 }
  }

  if (normalizedName === 'cavalo') {
    return { speciesLabel: 'Cavalo', divisor: 104 }
  }

  return null
}

export function AnimalDetailsPage() {
  const { animalId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSendingToAi, setIsSendingToAi] = useState(false)
  const [extractedValues, setExtractedValues] = useState<ExtractedExamValues | null>(null)
  const [extractedReferences, setExtractedReferences] = useState<ExtractedExamReferences>(
    EMPTY_EXTRACTED_REFERENCES,
  )
  const [latestExam, setLatestExam] = useState<LatestExamRecord | null>(null)
  const [pendingReviewValues, setPendingReviewValues] = useState<ExtractedExamValues | null>(null)
  const [pendingReviewReferences, setPendingReviewReferences] = useState<ExtractedExamReferences>(
    EMPTY_EXTRACTED_REFERENCES,
  )
  const [pendingSourceFileName, setPendingSourceFileName] = useState<string | null>(null)
  const [reviewDraftValues, setReviewDraftValues] =
    useState<ExtractedExamDraftValues>(buildDraftValues(EMPTY_EXTRACTED_VALUES))
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isSavingReviewedExam, setIsSavingReviewedExam] = useState(false)
  const [activeExamTab, setActiveExamTab] = useState<ExamCardTab>('extracoes')
  const extractedHco3 = extractedValues?.hco3 ?? null
  const extractedPco2 = extractedValues?.pco2 ?? null
  const extractedNa = extractedValues?.na ?? null
  const extractedCloro = extractedValues?.cloro ?? null
  const extractedPh = extractedValues?.ph ?? null
  const phReference = extractedReferences.ph
  const phReferenceBounds = resolveReferenceBounds(phReference)
  const correctedChlorideFormula = getCorrectedChlorideFormula(
    animal ? getAnimalTypeName(animal.animal_types) : null,
  )
  const expectedPco2Base = extractedHco3 !== null ? 1.5 * extractedHco3 + 8 : null
  const expectedPco2Min = expectedPco2Base !== null ? expectedPco2Base - 2 : null
  const expectedPco2Max = expectedPco2Base !== null ? expectedPco2Base + 2 : null
  const correctedChlorideValue =
    correctedChlorideFormula && extractedNa !== null && extractedCloro !== null && extractedNa !== 0
      ? extractedCloro * (correctedChlorideFormula.divisor / extractedNa)
      : null
  const pco2DisorderStatus =
    extractedPco2 === null
      ? 'Nao calculado (pCO2 do paciente nao encontrado).'
      : expectedPco2Min === null || expectedPco2Max === null
        ? 'Nao calculado (pCO2 esperada nao disponivel).'
        : extractedPco2 >= expectedPco2Min && extractedPco2 <= expectedPco2Max
          ? 'Disturbio simples'
          : extractedPco2 > expectedPco2Max
            ? 'Disturbio misto'
            : 'Fora da faixa esperada'
  const phStatus =
    extractedPh === null
      ? 'Nao calculado (pH nao encontrado).'
      : phReferenceBounds.min === null && phReferenceBounds.max === null
        ? 'Nao calculado (faixa de referencia do pH nao encontrada).'
        : phReferenceBounds.min !== null && extractedPh < phReferenceBounds.min
          ? 'Acidose'
          : phReferenceBounds.max !== null && extractedPh > phReferenceBounds.max
            ? 'Alcalose'
            : 'Dentro da faixa de referencia'

  useEffect(() => {
    void loadAnimal()
    void loadLatestExam()
  }, [animalId, user?.id])

  async function loadAnimal() {
    if (!animalId) {
      setErrorMessage('Animal invalido.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from('animals')
      .select('id, nome, sexo, idade_anos, peso_kg, observacoes, created_at, animal_types(nome)')
      .eq('id', animalId)
      .maybeSingle()

    if (error) {
      if (isAnimalsLegacySchemaError(error.message)) {
        const fallback = await supabase
          .from('animals')
          .select('id, nome, created_at, animal_types(nome)')
          .eq('id', animalId)
          .maybeSingle()

        if (fallback.error) {
          setErrorMessage(fallback.error.message)
          setAnimal(null)
          setIsLoading(false)
          return
        }

        if (!fallback.data) {
          setErrorMessage('Animal nao encontrado.')
          setAnimal(null)
          setIsLoading(false)
          return
        }

        setAnimal(normalizeAnimal(fallback.data as Animal))
        setErrorMessage(
          'Banco desatualizado: aplique as migracoes novas para visualizar sexo, idade, peso e observacoes.',
        )
        setIsLoading(false)
        return
      }

      setErrorMessage(error.message)
      setAnimal(null)
      setIsLoading(false)
      return
    }

    if (!data) {
      setErrorMessage('Animal nao encontrado.')
      setAnimal(null)
      setIsLoading(false)
      return
    }

    setAnimal(normalizeAnimal(data as Animal))
    setIsLoading(false)
  }

  async function loadLatestExam() {
    if (!animalId || !user) {
      setLatestExam(null)
      setExtractedValues(null)
      setExtractedReferences(EMPTY_EXTRACTED_REFERENCES)
      return
    }

    const { data, error } = await supabase
      .from('animal_latest_exams')
      .select('extracted_values, updated_at, source_file_name')
      .eq('animal_id', animalId)
      .maybeSingle()

    if (error) {
      setLatestExam(null)
      setExtractedValues(null)
      setExtractedReferences(EMPTY_EXTRACTED_REFERENCES)
      return
    }

    if (!data) {
      setLatestExam(null)
      setExtractedValues(null)
      setExtractedReferences(EMPTY_EXTRACTED_REFERENCES)
      return
    }

    const normalizedExam = normalizeExamPayload(data.extracted_values)

    setLatestExam({
      extractedValues: normalizedExam.values,
      extractedReferences: normalizedExam.references,
      updatedAt: data.updated_at,
      sourceFileName: data.source_file_name ?? null,
    })
    setExtractedValues(normalizedExam.values)
    setExtractedReferences(normalizedExam.references)
  }

  async function saveLatestExam(
    values: ExtractedExamValues,
    references: ExtractedExamReferences,
    sourceFileName: string | null,
  ) {
    if (!animalId || !user) {
      return
    }

    const payload = {
      animal_id: animalId,
      user_id: user.id,
      source_file_name: sourceFileName,
      extracted_values: {
        extracted: values,
        references,
      },
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('animal_latest_exams')
      .upsert(payload, { onConflict: 'animal_id' })
      .select('updated_at, source_file_name')
      .single()

    if (error) {
      throw new Error(`Falha ao salvar ultimo exame: ${error.message}`)
    }

    setLatestExam({
      extractedValues: values,
      extractedReferences: references,
      updatedAt: data.updated_at,
      sourceFileName: data.source_file_name ?? null,
    })
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setPendingReviewValues(null)
    setPendingReviewReferences(EMPTY_EXTRACTED_REFERENCES)
    setPendingSourceFileName(null)
    setReviewError(null)
    setReviewDraftValues(buildDraftValues(EMPTY_EXTRACTED_VALUES))

    if (!file) {
      setSelectedFile(null)
      setFileError(null)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setFileError('Arquivo muito grande. Envie no maximo 10MB.')
      return
    }

    if (!SUPPORTED_MIME_TYPES.has(file.type.toLowerCase())) {
      setSelectedFile(null)
      setFileError('Formato invalido. Use PDF, JPG, PNG ou WEBP.')
      return
    }

    setSelectedFile(file)
    setFileError(null)
  }

  async function convertFileToBase64(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Falha ao ler o arquivo.'))
          return
        }

        const [, base64 = ''] = reader.result.split(',')
        resolve(base64)
      }

      reader.onerror = () => reject(new Error('Falha ao converter o arquivo para base64.'))
      reader.readAsDataURL(file)
    })
  }

  async function handleSendToAi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!animal) {
      setFileError('Animal nao encontrado.')
      return
    }

    if (!selectedFile) {
      setFileError('Selecione um arquivo PDF ou imagem antes de enviar.')
      return
    }

    setFileError(null)
    setPendingReviewValues(null)
    setPendingReviewReferences(EMPTY_EXTRACTED_REFERENCES)
    setPendingSourceFileName(null)
    setReviewError(null)
    setIsSendingToAi(true)

    try {
      const fileBase64 = await convertFileToBase64(selectedFile)

      const { data, error } = await supabase.functions.invoke('interpret-animal-document', {
        body: {
          animalId: animal.id,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          fileBase64,
        },
      })

      if (error) {
        let detailedMessage = error.message
        const response = (error as { context?: Response }).context

        if (response) {
          const errorPayload = await response.json().catch(() => null)
          const maybeMessage =
            typeof errorPayload?.error === 'string'
              ? errorPayload.error
              : typeof errorPayload?.message === 'string'
                ? errorPayload.message
                : null

          if (maybeMessage) {
            detailedMessage = maybeMessage
          }
        }

        throw new Error(detailedMessage)
      }

      const normalizedValues = normalizeExtractedValues(data?.extracted ?? EMPTY_EXTRACTED_VALUES)
      const normalizedReferences = normalizeExtractedReferences(data?.references ?? EMPTY_EXTRACTED_REFERENCES)
      setPendingReviewValues(normalizedValues)
      setPendingReviewReferences(normalizedReferences)
      setPendingSourceFileName(selectedFile.name)
      setReviewDraftValues(buildDraftValues(normalizedValues))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar documento para a IA.'
      setFileError(message)
    } finally {
      setIsSendingToAi(false)
    }
  }

  function handleReviewValueChange(key: ExtractedExamValueKey, value: string) {
    setReviewDraftValues((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  async function handleConfirmReviewedExam() {
    if (!pendingReviewValues) {
      return
    }

    const { values, invalidFields } = parseDraftValues(reviewDraftValues)

    if (invalidFields.length > 0) {
      setReviewError(`Existem valores invalidos em: ${invalidFields.join(', ')}.`)
      return
    }

    setReviewError(null)
    setIsSavingReviewedExam(true)

    try {
      await saveLatestExam(values, pendingReviewReferences, pendingSourceFileName)
      setExtractedValues(values)
      setExtractedReferences(pendingReviewReferences)
      setPendingReviewValues(null)
      setPendingReviewReferences(EMPTY_EXTRACTED_REFERENCES)
      setPendingSourceFileName(null)
      setSelectedFile(null)
      setReviewDraftValues(buildDraftValues(EMPTY_EXTRACTED_VALUES))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar os valores revisados.'
      setReviewError(message)
    } finally {
      setIsSavingReviewedExam(false)
    }
  }

  function handleCancelReview() {
    setPendingReviewValues(null)
    setPendingReviewReferences(EMPTY_EXTRACTED_REFERENCES)
    setPendingSourceFileName(null)
    setReviewError(null)
    setReviewDraftValues(buildDraftValues(EMPTY_EXTRACTED_VALUES))
  }

  return (
    <PageContainer maxWidthClassName="max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes do animal</h1>
          <p className="text-sm text-slate-600">Area pronta para adicionar mais funcionalidades em seguida.</p>
        </div>

        <Button onClick={() => navigate('/dashboard')}>Voltar</Button>
      </div>

      {isLoading ? <p className="text-slate-700">Carregando...</p> : null}
      {errorMessage ? <AlertMessage message={errorMessage} /> : null}

      {!isLoading && !errorMessage && animal ? (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">{animal.nome}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimalInfoItem label="Especie" value={getAnimalTypeName(animal.animal_types)} />
              <AnimalInfoItem label="Sexo" value={animal.sexo || 'Nao informado'} />
              <AnimalInfoItem
                label="Idade"
                value={animal.idade_anos ? `${animal.idade_anos} ano(s)` : 'Nao informada'}
              />
              <AnimalInfoItem label="Peso" value={animal.peso_kg ? `${animal.peso_kg} kg` : 'Nao informado'} />
              <AnimalInfoItem label="Observacoes" value={animal.observacoes || 'Sem observacoes'} />
              <AnimalInfoItem label="ID" value={animal.id} breakAll />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Enviar documento para IA (Gemini)</h3>
            <p className="mt-1 text-sm text-slate-600">Selecione uma foto ou PDF para analise com prompt fixo.</p>

            <form className="mt-4 space-y-4" onSubmit={handleSendToAi}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="animal-document">
                  Documento (PDF ou imagem)
                </label>
                <input
                  id="animal-document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:font-medium hover:file:bg-slate-300"
                />
                <p className="mt-1 text-xs text-slate-500">Tamanho maximo: 10MB.</p>
              </div>

              <Button type="submit" disabled={isSendingToAi}>
                {isSendingToAi ? 'Enviando...' : 'Enviar para Gemini'}
              </Button>
            </form>

            {fileError ? <p className="mt-3 text-sm text-red-700">{fileError}</p> : null}
            {extractedValues ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h4 className="text-sm font-semibold text-emerald-900">
                  {latestExam ? 'Ultimo exame salvo' : 'Valores extraidos do exame'}
                </h4>
                {latestExam ? (
                  <p className="mt-1 text-xs text-emerald-800">
                    Ultimo exame: {formatDateTime(latestExam.updatedAt)}
                    {latestExam.sourceFileName ? ` - arquivo: ${latestExam.sourceFileName}` : ''}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveExamTab('extracoes')}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      activeExamTab === 'extracoes'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-emerald-300 bg-white text-emerald-800'
                    }`}
                  >
                    Extracoes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveExamTab('calculos')}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      activeExamTab === 'calculos'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-emerald-300 bg-white text-emerald-800'
                    }`}
                  >
                    Calculos e relacoes
                  </button>
                </div>

                {activeExamTab === 'extracoes' ? (
                  <ul className="mt-3 space-y-2">
                    {EXAM_PARAMETER_FIELDS.map((field) => (
                      <li
                        key={field.key}
                        className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{field.label}</p>
                        <p className="mt-1">
                          <span className="font-semibold">Resultado:</span>{' '}
                          {extractedValues[field.key] === null ? 'Nao encontrado' : extractedValues[field.key]}
                        </p>
                        <p>
                          <span className="font-semibold">Ref:</span>{' '}
                          {formatReferenceValue(extractedReferences[field.key])}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Estado acido-basico</p>
                      <p className="mt-1 text-sm text-slate-900">
                        Resultado: {extractedPh === null ? 'Nao encontrado' : extractedPh}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Interpretacao: {phStatus}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">pCO2 compensatoria</p>
                      {expectedPco2Base === null || expectedPco2Min === null || expectedPco2Max === null ? (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Nao calculada (HCO3 nao encontrado).
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Resultado esperado: {formatExamValue(expectedPco2Min)} a {formatExamValue(expectedPco2Max)}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-900">
                        Resultado paciente: {extractedPco2 === null ? 'Nao encontrado' : extractedPco2}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Interpretacao: {pco2DisorderStatus}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                        Cloro corrigido (mEq/L)
                      </p>
                      {!correctedChlorideFormula ? (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Interpretacao: Nao calculado (especie sem formula configurada).
                        </p>
                      ) : extractedCloro === null || extractedNa === null ? (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Interpretacao: Nao calculado (Na ou Cloro nao encontrado).
                        </p>
                      ) : extractedNa === 0 ? (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Interpretacao: Nao calculado (Na igual a 0).
                        </p>
                      ) : (
                        <>
                          <p className="mt-1 text-sm text-slate-900">
                            Resultado: {formatExamValue(correctedChlorideValue ?? 0)}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">Interpretacao: Calculado com sucesso</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      <p className="mt-4">
        <Link className="font-medium text-blue-700 hover:text-blue-800 hover:underline" to="/dashboard">
          Ir para lista de animais
        </Link>
      </p>

      {pendingReviewValues ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-amber-200 bg-white p-5 shadow-xl">
            <h4 className="text-lg font-semibold text-amber-900">Revise e edite antes de confirmar</h4>
            <p className="mt-1 text-sm text-amber-800">
              Confira os campos extraidos pela IA, ajuste se necessario e confirme para salvar e mostrar no exame
              principal.
              {pendingSourceFileName ? ` Arquivo: ${pendingSourceFileName}.` : ''}
            </p>

            <ul className="mt-4 space-y-2">
              {EXAM_PARAMETER_FIELDS.map((field) => (
                <li
                  key={field.key}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-900"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">{field.label}</p>
                  <label className="mt-1 block text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Resultado
                    <input
                      type="text"
                      value={reviewDraftValues[field.key]}
                      onChange={(event) => handleReviewValueChange(field.key, event.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold normal-case tracking-normal text-slate-900"
                      placeholder="Nao encontrado"
                    />
                  </label>
                  <p className="mt-2">
                    <span className="font-semibold">Ref:</span>{' '}
                    {formatReferenceValue(pendingReviewReferences[field.key])}
                  </p>
                </li>
              ))}
            </ul>

            {reviewError ? <p className="mt-3 text-sm text-red-700">{reviewError}</p> : null}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleCancelReview} disabled={isSavingReviewedExam}>
                Cancelar revisao
              </Button>
              <Button type="button" onClick={handleConfirmReviewedExam} disabled={isSavingReviewedExam}>
                {isSavingReviewedExam ? 'Salvando...' : 'Confirmar e salvar exame'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
