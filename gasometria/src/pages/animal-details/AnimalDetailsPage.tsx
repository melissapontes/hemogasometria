import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import {
  AlertMessage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PageContainer,
  Separator,
  TextInput,
} from '../../components/ui'
import { getAnimalTypeName, isAnimalsLegacySchemaError, normalizeAnimal } from '../../lib/animal-utils'
import { clearStoredAuthSession, supabase } from '../../lib/supabase'
import type { Animal } from '../../types/animals'
import { ParameterRangeBar } from './components/ParameterRangeBar'

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
  be_cf: number | null
  hco3: number | null
  tco2: number | null
  so2: number | null
  cso2: number | null
  na: number | null
  k: number | null
  ica: number | null
  glicose: number | null
  lactato: number | null
  anion_gap: number | null
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

type BloodType = 'venoso' | 'arterial'

type LatestExamRecord = {
  extractedValues: ExtractedExamValues
  extractedReferences: ExtractedExamReferences
  updatedAt: string
  sourceFileName: string | null
  examDate: string | null
  bloodType: BloodType | null
}

const EMPTY_EXTRACTED_VALUES: ExtractedExamValues = {
  ph: null,
  pco2: null,
  po2: null,
  be: null,
  be_cf: null,
  hco3: null,
  tco2: null,
  so2: null,
  cso2: null,
  na: null,
  k: null,
  ica: null,
  glicose: null,
  lactato: null,
  anion_gap: null,
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
  be_cf: { ...EMPTY_REFERENCE_RANGE },
  hco3: { ...EMPTY_REFERENCE_RANGE },
  tco2: { ...EMPTY_REFERENCE_RANGE },
  so2: { ...EMPTY_REFERENCE_RANGE },
  cso2: { ...EMPTY_REFERENCE_RANGE },
  na: { ...EMPTY_REFERENCE_RANGE },
  k: { ...EMPTY_REFERENCE_RANGE },
  ica: { ...EMPTY_REFERENCE_RANGE },
  glicose: { ...EMPTY_REFERENCE_RANGE },
  lactato: { ...EMPTY_REFERENCE_RANGE },
  anion_gap: { ...EMPTY_REFERENCE_RANGE },
  hematocrito: { ...EMPTY_REFERENCE_RANGE },
  hemoglobina: { ...EMPTY_REFERENCE_RANGE },
  temperatura: { ...EMPTY_REFERENCE_RANGE },
  cloro: { ...EMPTY_REFERENCE_RANGE },
}

const EXAM_PARAMETER_FIELDS: Array<{ key: ExtractedExamValueKey; label: string; unit?: string }> = [
  { key: 'ph', label: 'pH' },
  { key: 'hco3', label: 'HCO3', unit: 'mmol/L' },
  { key: 'pco2', label: 'pCO2', unit: 'mmHg' },
  { key: 'po2', label: 'pO2', unit: 'mmHg' },
  { key: 'be', label: 'BE', unit: 'mmol/L' },
  { key: 'be_cf', label: 'BE cf', unit: 'mmol/L' },
  { key: 'tco2', label: 'tCO2', unit: 'mmol/L' },
  { key: 'so2', label: 'sO2', unit: '%' },
  { key: 'cso2', label: 'CSO2', unit: '%' },
  { key: 'na', label: 'Sódio (Na)', unit: 'mmol/L' },
  { key: 'k', label: 'Potássio (K)', unit: 'mmol/L' },
  { key: 'ica', label: 'Ca++', unit: 'mmol/L' },
  { key: 'glicose', label: 'Glicose', unit: 'mg/dL' },
  { key: 'lactato', label: 'Lactato', unit: 'mmol/L' },
  { key: 'anion_gap', label: 'Ânion Gap', unit: 'mmol/L' },
  { key: 'hematocrito', label: 'Hematócrito', unit: '%' },
  { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL' },
  { key: 'temperatura', label: 'Temperatura', unit: '°C' },
  { key: 'cloro', label: 'Cloro (Cl)', unit: 'mmol/L' },
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
    be_cf: toDraftValue(values.be_cf),
    hco3: toDraftValue(values.hco3),
    tco2: toDraftValue(values.tco2),
    so2: toDraftValue(values.so2),
    cso2: toDraftValue(values.cso2),
    na: toDraftValue(values.na),
    k: toDraftValue(values.k),
    ica: toDraftValue(values.ica),
    glicose: toDraftValue(values.glicose),
    lactato: toDraftValue(values.lactato),
    anion_gap: toDraftValue(values.anion_gap),
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
    be_cf: normalizeNumber(input.be_cf),
    hco3: normalizeNumber(input.hco3),
    tco2: normalizeNumber(input.tco2),
    so2: normalizeNumber(input.so2),
    cso2: normalizeNumber(input.cso2),
    na: normalizeNumber(input.na),
    k: normalizeNumber(input.k),
    ica: normalizeNumber(input.ica),
    glicose: normalizeNumber(input.glicose),
    lactato: normalizeNumber(input.lactato),
    anion_gap: normalizeNumber(input.anion_gap),
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
    be_cf: normalizeReferenceRange(input.be_cf),
    hco3: normalizeReferenceRange(input.hco3),
    tco2: normalizeReferenceRange(input.tco2),
    so2: normalizeReferenceRange(input.so2),
    cso2: normalizeReferenceRange(input.cso2),
    na: normalizeReferenceRange(input.na),
    k: normalizeReferenceRange(input.k),
    ica: normalizeReferenceRange(input.ica),
    glicose: normalizeReferenceRange(input.glicose),
    lactato: normalizeReferenceRange(input.lactato),
    anion_gap: normalizeReferenceRange(input.anion_gap),
    hematocrito: normalizeReferenceRange(input.hematocrito),
    hemoglobina: normalizeReferenceRange(input.hemoglobina),
    temperatura: normalizeReferenceRange(input.temperatura),
    cloro: normalizeReferenceRange(input.cloro),
  }
}

function normalizeExamPayload(raw: unknown): {
  values: ExtractedExamValues
  references: ExtractedExamReferences
  examDate: string | null
  bloodType: BloodType | null
} {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const extractedSource = typeof input.extracted !== 'undefined' ? input.extracted : input
  const referencesSource = input.references
  const examDate = typeof input.exam_date === 'string' ? input.exam_date : null
  const bloodTypeRaw = input.blood_type
  const bloodType: BloodType | null =
    bloodTypeRaw === 'venoso' || bloodTypeRaw === 'arterial' ? bloodTypeRaw : null

  return {
    values: normalizeExtractedValues(extractedSource),
    references: normalizeExtractedReferences(referencesSource),
    examDate,
    bloodType,
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

  return 'Não encontrado'
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

  if (normalizedName === 'cao' || normalizedName === 'canina') {
    return { speciesLabel: 'Canina', divisor: 146 }
  }

  if (normalizedName === 'gato' || normalizedName === 'felina') {
    return { speciesLabel: 'Felina', divisor: 156 }
  }

  if (normalizedName === 'cavalo' || normalizedName === 'equina') {
    return { speciesLabel: 'Equina', divisor: 104 }
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
  const [reviewExamDate, setReviewExamDate] = useState<string>('')
  const [reviewBloodType, setReviewBloodType] = useState<BloodType | ''>('')
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false)
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

  const extractedK = extractedValues?.k ?? null
  const extractedAnionGap = extractedValues?.anion_gap ?? null
  const calculatedAnionGap =
    extractedAnionGap === null &&
    extractedNa !== null && extractedK !== null && extractedHco3 !== null && extractedCloro !== null
      ? (extractedNa + extractedK) - (extractedHco3 + extractedCloro)
      : null

  const phStatus =
    extractedPh === null
      ? 'Não calculado (pH não encontrado).'
      : phReferenceBounds.min === null && phReferenceBounds.max === null
        ? 'Não calculado (faixa de referência do pH não encontrada).'
        : phReferenceBounds.min !== null && extractedPh < phReferenceBounds.min
          ? 'Acidemia'
          : phReferenceBounds.max !== null && extractedPh > phReferenceBounds.max
            ? 'Alcalemia'
            : 'Dentro da faixa de referência'

  const hco3ReferenceBounds = resolveReferenceBounds(extractedReferences.hco3)
  const pco2ReferenceBounds = resolveReferenceBounds(extractedReferences.pco2)

  function getDirection(value: number | null, min: number | null, max: number | null): 'low' | 'high' | 'normal' | null {
    if (value === null) return null
    if (min !== null && value < min) return 'low'
    if (max !== null && value > max) return 'high'
    return 'normal'
  }

  const phDir = getDirection(extractedPh, phReferenceBounds.min, phReferenceBounds.max)
  const hco3Dir = getDirection(extractedHco3, hco3ReferenceBounds.min, hco3ReferenceBounds.max)
  const pco2Dir = getDirection(extractedPco2, pco2ReferenceBounds.min, pco2ReferenceBounds.max)

  const acidBaseBase =
    phDir === 'low' && hco3Dir === 'low' ? 'Acidose metabólica' :
    phDir === 'low' && pco2Dir === 'high' ? 'Acidose respiratória' :
    phDir === 'high' && hco3Dir === 'high' ? 'Alcalose metabólica' :
    phDir === 'high' && pco2Dir === 'low' ? 'Alcalose respiratória' :
    null

  const winterCompensation =
    acidBaseBase === 'Acidose metabólica' && expectedPco2Min !== null && expectedPco2Max !== null && extractedPco2 !== null
      ? extractedPco2 >= expectedPco2Min && extractedPco2 <= expectedPco2Max
        ? 'compensação adequada'
        : extractedPco2 > expectedPco2Max
          ? 'acidose respiratória associada'
          : 'alcalose respiratória associada'
      : null

  const acidBaseInterpretation =
    acidBaseBase === null ? null :
    winterCompensation !== null ? `${acidBaseBase} com ${winterCompensation}` :
    acidBaseBase

  useEffect(() => {
    void loadAnimal()
    void loadLatestExam()
  }, [animalId, user?.id])

  async function loadAnimal() {
    if (!animalId) {
      setErrorMessage('Animal inválido.')
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
          setErrorMessage('Animal não encontrado.')
          setAnimal(null)
          setIsLoading(false)
          return
        }

        setAnimal(normalizeAnimal(fallback.data as Animal))
        setErrorMessage(
          'Banco desatualizado: aplique as migrações novas para visualizar sexo, idade, peso e observações.',
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
      setErrorMessage('Animal não encontrado.')
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
      examDate: normalizedExam.examDate,
      bloodType: normalizedExam.bloodType,
    })
    setExtractedValues(normalizedExam.values)
    setExtractedReferences(normalizedExam.references)
  }

  async function saveLatestExam(
    values: ExtractedExamValues,
    references: ExtractedExamReferences,
    sourceFileName: string | null,
    examDate: string | null,
    bloodType: BloodType | null,
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
        exam_date: examDate,
        blood_type: bloodType,
      },
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('animal_latest_exams')
      .upsert(payload, { onConflict: 'animal_id' })
      .select('updated_at, source_file_name')
      .single()

    if (error) {
      throw new Error(`Falha ao salvar último exame: ${error.message}`)
    }

    setLatestExam({
      extractedValues: values,
      extractedReferences: references,
      updatedAt: data.updated_at,
      sourceFileName: data.source_file_name ?? null,
      examDate,
      bloodType,
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
      setFileError('Arquivo muito grande. Envie no máximo 10MB.')
      return
    }

    if (!SUPPORTED_MIME_TYPES.has(file.type.toLowerCase())) {
      setSelectedFile(null)
      setFileError('Formato inválido. Use PDF, JPG, PNG ou WEBP.')
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
      setFileError('Animal não encontrado.')
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const session = sessionData.session
      const sessionErrorMessage = sessionError?.message?.toLowerCase() ?? ''
      const isInvalidRefreshToken =
        sessionErrorMessage.includes('invalid refresh token') ||
        sessionErrorMessage.includes('refresh token not found')

      if (isInvalidRefreshToken || !session?.access_token) {
        clearStoredAuthSession()
        await supabase.auth.signOut({ scope: 'local' })
        setFileError('Sua sessão expirou. Faça login novamente.')
        navigate('/login', { replace: true })
        return
      }

      const fileBase64 = await convertFileToBase64(selectedFile)

      const { data, error } = await supabase.functions.invoke('interpret-animal-document', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
      if (typeof data?.exam_date === 'string' && data.exam_date.trim()) {
        setReviewExamDate(data.exam_date.trim())
      }
      setIsExtractDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar documento para a IA.'
      const normalizedMessage = message.toLowerCase()
      const isUnauthorized =
        normalizedMessage.includes('401') ||
        normalizedMessage.includes('unauthorized') ||
        normalizedMessage.includes('invalid jwt') ||
        normalizedMessage.includes('jwt')

      if (isUnauthorized) {
        clearStoredAuthSession()
        await supabase.auth.signOut({ scope: 'local' })
        setFileError('Sua sessão expirou. Faça login novamente.')
        navigate('/login', { replace: true })
      } else {
        setFileError(message)
      }
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
      setReviewError(`Existem valores inválidos em: ${invalidFields.join(', ')}.`)
      return
    }

    setReviewError(null)
    setIsSavingReviewedExam(true)

    try {
      await saveLatestExam(
        values,
        pendingReviewReferences,
        pendingSourceFileName,
        reviewExamDate || null,
        reviewBloodType || null,
      )
      setExtractedValues(values)
      setExtractedReferences(pendingReviewReferences)
      setPendingReviewValues(null)
      setPendingReviewReferences(EMPTY_EXTRACTED_REFERENCES)
      setPendingSourceFileName(null)
      setSelectedFile(null)
      setReviewDraftValues(buildDraftValues(EMPTY_EXTRACTED_VALUES))
      setReviewExamDate('')
      setReviewBloodType('')
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
    setReviewExamDate('')
    setReviewBloodType('')
  }

  return (
    <PageContainer maxWidthClassName="max-w-4xl">
      <section className="mb-4 border-b border-slate-200/80 pb-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            aria-label="Voltar"
            className="flex items-center justify-center rounded-full p-1 text-slate-600 hover:bg-slate-200/60"
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="truncate text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
            {animal?.nome ?? 'Animal'}
          </h1>
        </div>

        {animal && (
          <article className="rounded-3xl border border-slate-200/90 bg-white/75 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] backdrop-blur-[1px]">
            <p className="text-lg font-bold leading-tight text-slate-900">{animal.nome}</p>
            <p className="mt-1 text-sm text-slate-500">Espécie: {getAnimalTypeName(animal.animal_types)}</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-sm text-slate-500">Sexo: {(animal.sexo === 'Femea' ? 'Fêmea' : animal.sexo) || 'Não informado'}</p>
              <p className="text-sm text-slate-500">Idade: {animal.idade_anos ? `${animal.idade_anos} ano(s)` : 'Não informada'}</p>
            </div>
          </article>
        )}
      </section>

      {isLoading ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
          Carregando...
        </div>
      ) : null}
      {errorMessage ? <AlertMessage message={errorMessage} /> : null}

      {!isLoading && !errorMessage && animal ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Resultados do exame</h3>
          </div>

          {extractedValues ? (
            <div className="rounded-2xl border border-emerald-200 bg-[#36494f] p-4">
                <h4 className="text-sm font-semibold text-white">
                  {latestExam ? 'Último exame salvo' : 'Valores extraídos do exame'}
                </h4>
                {latestExam ? (
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/70">
                    {latestExam.examDate ? (
                      <span>Data: {new Date(latestExam.examDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    ) : null}
                    {latestExam.bloodType ? (
                      <span>Sangue: {latestExam.bloodType === 'venoso' ? 'Venoso' : 'Arterial'}</span>
                    ) : null}
                    <span>Salvo em: {formatDateTime(latestExam.updatedAt)}</span>
                    {latestExam.sourceFileName ? <span>Arquivo: {latestExam.sourceFileName}</span> : null}
                  </div>
                ) : null}
                {acidBaseInterpretation && (
                  <div className={`mt-3 rounded-xl px-4 py-3 bg-white border ${acidBaseInterpretation.startsWith('Acidose') ? 'border-red-400' : 'border-blue-400'}`}>
                    <p className="text-xs font-semibold tracking-wide mb-0.5 text-slate-900">
                      Interpretação ácido-base
                    </p>
                    <p className={`text-base font-bold ${acidBaseInterpretation.startsWith('Acidose') ? 'text-red-700' : 'text-blue-700'}`}>
                      {acidBaseInterpretation}
                    </p>
                  </div>
                )}
                <ul className="mt-3 grid grid-cols-1 gap-2">
                    {EXAM_PARAMETER_FIELDS.map((field) => {
                      const reference = extractedReferences[field.key]
                      const referenceBounds = resolveReferenceBounds(reference)
                      const patientValue = extractedValues[field.key]

                      return (
                        <li
                          key={field.key}
                          className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {/* Nome do exame destacado */}
                          <p className="text-xs font-extrabold tracking-wide text-emerald-700">
                            {field.label}{field.unit ? ` (${field.unit})` : ''}
                          </p>
                          {/* Resultado extraído destacado */}
                          <p className="mt-1 text-lg font-extrabold text-sky-700">
                            {patientValue === null ? 'Não encontrado' : patientValue}
                            {field.key === 'ph' && referenceBounds.min !== null && patientValue !== null && patientValue < referenceBounds.min && (
                              <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Acidemia
                              </span>
                            )}
                            {field.key === 'ph' && referenceBounds.max !== null && patientValue !== null && patientValue > referenceBounds.max && (
                              <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                Alcalemia
                              </span>
                            )}
                            {field.key === 'hco3' && acidBaseBase === 'Acidose metabólica' && (
                              <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Acidose metabólica
                              </span>
                            )}
                            {field.key === 'hco3' && acidBaseBase === 'Alcalose metabólica' && (
                              <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                Alcalose metabólica
                              </span>
                            )}
                            {field.key === 'pco2' && (phDir === 'low' && pco2Dir === 'high' || winterCompensation === 'acidose respiratória associada') && (
                              <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Acidose respiratória
                              </span>
                            )}
                            {field.key === 'pco2' && phDir === 'high' && pco2Dir === 'low' && (
                              <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                Alcalose respiratória
                              </span>
                            )}
                          </p>

                          {(() => {
                            const showCompensatory = field.key === 'pco2' && phStatus === 'Acidemia' && expectedPco2Min !== null && expectedPco2Max !== null

                            if (showCompensatory) {
                              const allValues = [
                                referenceBounds.min,
                                referenceBounds.max,
                                expectedPco2Min,
                                expectedPco2Max,
                                patientValue,
                              ].filter((v): v is number => v !== null)
                              const overallMin = Math.min(...allValues)
                              const overallMax = Math.max(...allValues)
                              const overallSpan = overallMax - overallMin
                              const sharedVisualMin = overallMin - overallSpan * 0.2
                              const sharedVisualMax = overallMax + overallSpan * 0.2

                              return (
                                <>
                                  <div className="mt-2">

                                    <ParameterRangeBar
                                      label={field.label}
                                      max={referenceBounds.max}
                                      min={referenceBounds.min}
                                      patientValue={patientValue}
                                      forcedVisualMin={sharedVisualMin}
                                      forcedVisualMax={sharedVisualMax}
                                    />
                                  </div>
                                  <div className="mt-5">
                                    <p className="text-xs font-semibold tracking-wide mb-0.5" style={{ color: '#4d4d4d' }}>
                                      pCO2 compensatória esperada: {formatExamValue(expectedPco2Min!)} a {formatExamValue(expectedPco2Max!)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mb-1">
                                      Fórmula de Winter: pCO2 = (1.5 × HCO3) + 8 ± 2
                                    </p>
                                    <ParameterRangeBar
                                      label="pCO2 compensatória"
                                      min={expectedPco2Min!}
                                      max={expectedPco2Max!}
                                      patientValue={patientValue as number | null}
                                      patientLabel="Paciente"
                                      forcedVisualMin={sharedVisualMin}
                                      forcedVisualMax={sharedVisualMax}
                                      barColor="#9a00ff"
                                      labelDecimals={1}
                                      labelColor="#9a00ff"
                                    />
                                  </div>
                                </>
                              )
                            }

                            return (
                              <div className="mt-2">
                                <ParameterRangeBar
                                  label={field.label}
                                  max={referenceBounds.max}
                                  min={referenceBounds.min}
                                  patientValue={patientValue}
                                />
                              </div>
                            )
                          })()}
                          {field.key === 'anion_gap' && extractedAnionGap === null && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-500 tracking-wide mb-1">Ânion Gap calculado (mEq/L)</p>
                              {calculatedAnionGap === null ? (
                                <p className="text-xs text-slate-600">Não calculado (Na, K, HCO3 ou Cloro não encontrado).</p>
                              ) : (
                                <>
                                  <p className="text-xs text-slate-600">
                                    Resultado: {formatExamValue(calculatedAnionGap)}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Fórmula: AG = (Na + K) − (HCO3 + Cl)
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                          {field.key === 'cloro' && (
                            <div className="mt-3">
                              {!correctedChlorideFormula ? (
                                <p className="text-xs text-slate-600">Cloro corrigido (mEq/L): Não calculado (espécie sem fórmula configurada).</p>
                              ) : extractedCloro === null || extractedNa === null ? (
                                <p className="text-xs text-slate-600">Cloro corrigido (mEq/L): Não calculado (Na ou Cloro não encontrado).</p>
                              ) : extractedNa === 0 ? (
                                <p className="text-xs text-slate-600">Cloro corrigido (mEq/L): Não calculado (Na igual a 0).</p>
                              ) : (
                                <>
                                  <p className="text-xs text-slate-600">Cloro corrigido (mEq/L): {formatExamValue(correctedChlorideValue ?? 0)}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Fórmula ({correctedChlorideFormula.speciesLabel}): Cl corrigido = Cl × ({correctedChlorideFormula.divisor} / Na)
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </li>
                      )
                    })}
                </ul>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300/80 bg-white/60 p-4 text-sm text-slate-600">
              Nenhum exame extraído ainda. Toque no botão abaixo para enviar documento ou foto.
            </p>
          )}

          <Button
            className="w-full sm:w-auto"
            type="button"
            variant="primary"
            onClick={() => {
              setSelectedFile(null)
              setFileError(null)
              setIsExtractDialogOpen(true)
            }}
          >
            Extrair novo documento
          </Button>
        </section>
      ) : null}

      <Separator className="my-4" />
      <Link className="text-sm font-medium text-cyan-700 hover:underline" to="/dashboard">
        Ir para lista de animais
      </Link>

      <Dialog open={isExtractDialogOpen} onOpenChange={setIsExtractDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extrair novo documento</DialogTitle>
            <DialogDescription>Envie foto ou PDF para extrair os parâmetros.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSendToAi}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="animal-document">
                Documento (PDF ou imagem)
              </label>
              <label
                htmlFor="animal-document"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                <span className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Escolher arquivo
                </span>
                <span className="truncate text-slate-500">
                  {selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}
                </span>
              </label>
              <input
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                id="animal-document"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
              />
              <p className="text-xs text-slate-500">Tamanho máximo: 10MB.</p>
            </div>

            {fileError ? <p className="text-sm text-red-700">{fileError}</p> : null}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsExtractDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSendingToAi}>
                {isSendingToAi ? 'Enviando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <Dialog
        open={Boolean(pendingReviewValues)}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelReview()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revise e edite antes de confirmar</DialogTitle>
            <DialogDescription>
              Confira os campos extraídos pela IA, ajuste se necessário e confirme para salvar.
              {pendingSourceFileName ? ` Arquivo: ${pendingSourceFileName}.` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-slate-700">Data do exame</label>
              <TextInput
                type="date"
                value={reviewExamDate}
                onChange={(e) => setReviewExamDate(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-slate-700">Tipo de sangue</label>
              <select
                value={reviewBloodType}
                onChange={(e) => setReviewBloodType(e.target.value as BloodType | '')}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <option value="">Selecione</option>
                <option value="venoso">Venoso</option>
                <option value="arterial">Arterial</option>
              </select>
            </div>
          </div>

            <ul className="space-y-2">
              {EXAM_PARAMETER_FIELDS.map((field) => (
                <li key={field.key} className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm">
                  <p className="text-xs font-medium tracking-wide text-amber-700">{field.label}</p>
                  <div className="mt-1 space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-slate-700">Resultado</label>
                    <TextInput
                    placeholder="Não encontrado"
                    value={reviewDraftValues[field.key]}
                    onChange={(event) => handleReviewValueChange(field.key, event.target.value)}
                    />
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold">Ref:</span> {formatReferenceValue(pendingReviewReferences[field.key])}
                  </p>
                </li>
              ))}
            </ul>

            {reviewError ? <p className="text-sm font-medium text-red-600">{reviewError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancelReview} disabled={isSavingReviewedExam}>
              Cancelar revisão
            </Button>
            <Button type="button" onClick={handleConfirmReviewedExam} disabled={isSavingReviewedExam}>
              {isSavingReviewedExam ? 'Salvando...' : 'Confirmar e salvar exame'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}







