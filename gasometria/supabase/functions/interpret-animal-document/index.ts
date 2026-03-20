import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RequestPayload = {
  animalId?: string
  fileName?: string
  mimeType?: string
  fileBase64?: string
}

const FIELD_KEYS = [
  'ph',
  'pco2',
  'po2',
  'be',
  'hco3',
  'tco2',
  'so2',
  'na',
  'k',
  'ica',
  'glicose',
  'hematocrito',
  'hemoglobina',
  'temperatura',
  'cloro',
] as const

type ExamFieldKey = (typeof FIELD_KEYS)[number]

type ExtractedExamValues = Record<ExamFieldKey, number | null>

type ReferenceRange = {
  raw: string | null
  min: number | null
  max: number | null
}

type ExtractedExamReferences = Record<ExamFieldKey, ReferenceRange>

const FIXED_PROMPT = `
Voce e um sistema de extracao de dados clinicos especializado em exames laboratoriais.

Sua unica funcao e identificar e extrair, para cada parametro solicitado:
1) valor do Resultado
2) valor de Referencia da maquina (coluna Ref/Rel)

REGRAS CRITICAS:
- NAO interpretar
- NAO explicar
- NAO adicionar texto
- NAO inferir valores
- NAO retornar nada alem do JSON
- Se um valor nao estiver presente, retornar null
- Nunca inventar dados
- Nunca misturar Resultado com Referencia

EXTRAIR APENAS OS SEGUINTES PARAMETROS:
- pH
- pCO2
- pO2
- BE (Excesso de Base)
- HCO3 (Bicarbonato)
- tCO2
- sO2
- Sodio (Na)
- Potassio (K)
- iCa (Calcio ionico / ionizado)
- Glicose
- Hematocrito
- Hemoglobina
- Temperatura
- Cloro (Cloreto)

REGRAS DE IDENTIFICACAO:
- pH -> "pH"
- pCO2 -> "pCO2", "PaCO2"
- pO2 -> "pO2", "PaO2"
- BE -> "BE", "Base Excess", "Excesso de Base"
- HCO3 -> "HCO3", "Bicarbonato"
- tCO2 -> "tCO2", "TCO2"
- sO2 -> "sO2", "SatO2", "Saturacao de O2"
- Sodio -> "Na", "Sodio"
- Potassio -> "K", "Potassio"
- iCa -> "iCa", "Calcio ionico", "Calcio ionizado"
- Glicose -> "Glicose", "Glucose", "Glu"
- Hematocrito -> "Ht", "Hematocrito"
- Hemoglobina -> "Hb", "Hemoglobina"
- Temperatura -> "Temp", "Temperatura"
- Cloro -> "Cl", "Cloro", "Cloreto", "Chloride"

REGRAS DE EXTRACAO:
- Resultado: extrair APENAS o numero (sem unidade)
- Converter virgula para ponto (ex: 7,35 -> 7.35)
- Nao incluir texto junto do numero
- Referencia: extrair da coluna Ref/Rel do MESMO parametro
- Em referencia, retornar:
  - raw: texto da referencia (ex: "33.0-50.0")
  - min: limite inferior quando existir
  - max: limite superior quando existir
- Se referencia vier com formato diferente (ex: ">95"), manter raw e preencher min/max apenas quando claro

FORMATO DE SAIDA OBRIGATORIO:
Retorne APENAS um JSON valido com este formato:
{
  "extracted": {
    "ph": number|null,
    "pco2": number|null,
    "po2": number|null,
    "be": number|null,
    "hco3": number|null,
    "tco2": number|null,
    "so2": number|null,
    "na": number|null,
    "k": number|null,
    "ica": number|null,
    "glicose": number|null,
    "hematocrito": number|null,
    "hemoglobina": number|null,
    "temperatura": number|null,
    "cloro": number|null
  },
  "references": {
    "ph": { "raw": string|null, "min": number|null, "max": number|null },
    "pco2": { "raw": string|null, "min": number|null, "max": number|null },
    "po2": { "raw": string|null, "min": number|null, "max": number|null },
    "be": { "raw": string|null, "min": number|null, "max": number|null },
    "hco3": { "raw": string|null, "min": number|null, "max": number|null },
    "tco2": { "raw": string|null, "min": number|null, "max": number|null },
    "so2": { "raw": string|null, "min": number|null, "max": number|null },
    "na": { "raw": string|null, "min": number|null, "max": number|null },
    "k": { "raw": string|null, "min": number|null, "max": number|null },
    "ica": { "raw": string|null, "min": number|null, "max": number|null },
    "glicose": { "raw": string|null, "min": number|null, "max": number|null },
    "hematocrito": { "raw": string|null, "min": number|null, "max": number|null },
    "hemoglobina": { "raw": string|null, "min": number|null, "max": number|null },
    "temperatura": { "raw": string|null, "min": number|null, "max": number|null },
    "cloro": { "raw": string|null, "min": number|null, "max": number|null }
  }
}

PROIBIDO:
- Retornar texto fora do JSON
- Explicar o exame
- Diagnosticar
- Completar valores ausentes
- Retornar unidades
`.trim()

const RECOVERY_PROMPT = `
Retorne APENAS um JSON valido e completo com os objetos obrigatorios "extracted" e "references".
Em "extracted", inclua as 15 chaves: ph, pco2, po2, be, hco3, tco2, so2, na, k, ica, glicose, hematocrito, hemoglobina, temperatura, cloro.
Em "references", inclua as mesmas 15 chaves e cada uma com: raw, min, max.
Se nao encontrar algum valor, use null.
Nao retorne texto fora do JSON.
`.trim()

const EMPTY_REFERENCE_RANGE: ReferenceRange = {
  raw: null,
  min: null,
  max: null,
}

function buildEmptyExtractedValues(): ExtractedExamValues {
  return Object.fromEntries(FIELD_KEYS.map((key) => [key, null])) as ExtractedExamValues
}

function buildEmptyExtractedReferences(): ExtractedExamReferences {
  return Object.fromEntries(FIELD_KEYS.map((key) => [key, { ...EMPTY_REFERENCE_RANGE }])) as ExtractedExamReferences
}

const EMPTY_EXTRACTED_VALUES = buildEmptyExtractedValues()
const EMPTY_EXTRACTED_REFERENCES = buildEmptyExtractedReferences()

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

function normalizeReferenceRange(raw: unknown): ReferenceRange {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const rawText = typeof input.raw === 'string' ? input.raw.trim() : ''

  return {
    raw: rawText ? rawText : null,
    min: normalizeNumber(input.min),
    max: normalizeNumber(input.max),
  }
}

function normalizeExtractedValues(raw: unknown): ExtractedExamValues {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const values = buildEmptyExtractedValues()

  for (const key of FIELD_KEYS) {
    values[key] = normalizeNumber(input[key])
  }

  return values
}

function normalizeExtractedReferences(raw: unknown): ExtractedExamReferences {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const references = buildEmptyExtractedReferences()

  for (const key of FIELD_KEYS) {
    references[key] = normalizeReferenceRange(input[key])
  }

  return references
}

function countExtractedValues(values: ExtractedExamValues): number {
  let count = 0

  for (const key of FIELD_KEYS) {
    if (values[key] !== null) {
      count += 1
    }
  }

  return count
}

function countExtractedReferences(references: ExtractedExamReferences): number {
  let count = 0

  for (const key of FIELD_KEYS) {
    const range = references[key]
    if (range.raw !== null || range.min !== null || range.max !== null) {
      count += 1
    }
  }

  return count
}

function buildQualityScore(values: ExtractedExamValues, references: ExtractedExamReferences): number {
  return countExtractedValues(values) * 3 + countExtractedReferences(references)
}

function parseGeminiJson(rawText: string): Record<string, unknown> {
  const trimmed = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  if (!trimmed) {
    return {}
  }

  try {
    return JSON.parse(trimmed) as Record<string, unknown>
  } catch {
    if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
      try {
        return JSON.parse(`${trimmed}}`) as Record<string, unknown>
      } catch {
        // segue para outras estrategias
      }
    }

    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      const possibleJson = trimmed.slice(start, end + 1)
      try {
        return JSON.parse(possibleJson) as Record<string, unknown>
      } catch {
        // segue para outras estrategias
      }
    }

    if (!trimmed.startsWith('{') && trimmed.includes(':')) {
      const wrapped = `{${trimmed}}`
      try {
        return JSON.parse(wrapped) as Record<string, unknown>
      } catch {
        const withoutTrailingComma = wrapped.replace(/,\s*}/g, '}')
        try {
          return JSON.parse(withoutTrailingComma) as Record<string, unknown>
        } catch {
          // segue para fallback final
        }
      }
    }

    const pairRegex = /"([a-zA-Z0-9_]+)"\s*:\s*(-?\d+(?:[.,]\d+)?|null)/g
    const extracted: Record<string, unknown> = {}
    let match: RegExpExecArray | null = null

    while (true) {
      match = pairRegex.exec(trimmed)
      if (!match) {
        break
      }

      const key = match[1]?.trim()
      const rawValue = match[2]?.trim().replace(',', '.')
      if (!key || !rawValue) {
        continue
      }

      extracted[key] = rawValue.toLowerCase() === 'null' ? null : Number(rawValue)
    }

    if (Object.keys(extracted).length > 0) {
      return extracted
    }
  }

  return {}
}

function buildResponseSchema() {
  const extractedProperties = Object.fromEntries(
    FIELD_KEYS.map((key) => [key, { type: 'NUMBER', nullable: true }]),
  )

  const rangeSchema = {
    type: 'OBJECT',
    properties: {
      raw: { type: 'STRING', nullable: true },
      min: { type: 'NUMBER', nullable: true },
      max: { type: 'NUMBER', nullable: true },
    },
    required: ['raw', 'min', 'max'],
  }

  const referencesProperties = Object.fromEntries(FIELD_KEYS.map((key) => [key, rangeSchema]))

  return {
    type: 'OBJECT',
    properties: {
      extracted: {
        type: 'OBJECT',
        properties: extractedProperties,
        required: [...FIELD_KEYS],
      },
      references: {
        type: 'OBJECT',
        properties: referencesProperties,
        required: [...FIELD_KEYS],
      },
    },
    required: ['extracted', 'references'],
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY nao configurada no Supabase.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await request.json()) as RequestPayload
    const mimeType = body.mimeType?.trim()
    const fileBase64 = body.fileBase64?.trim()

    if (!mimeType || !fileBase64) {
      return new Response(JSON.stringify({ error: 'mimeType e fileBase64 sao obrigatorios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = `
${FIXED_PROMPT}
Animal ID: ${body.animalId ?? 'nao informado'}
Arquivo: ${body.fileName ?? 'nao informado'}
`.trim()

    const generationConfig = {
      maxOutputTokens: 4096,
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: buildResponseSchema(),
    }

    async function callGemini(promptText: string) {
      return await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: fileBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig,
          }),
        },
      )
    }

    const geminiResponse = await callGemini(prompt)

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      const status = geminiResponse.status >= 400 && geminiResponse.status < 600 ? geminiResponse.status : 502

      return new Response(JSON.stringify({ error: `Falha no Gemini (${status}): ${errorText}` }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiData = await geminiResponse.json()
    const allParts = Array.isArray(geminiData?.candidates?.[0]?.content?.parts)
      ? geminiData.candidates[0].content.parts
      : []
    let rawText = allParts
      .map((part: { text?: string }) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim()
    let finishReason = geminiData?.candidates?.[0]?.finishReason ?? null

    if (!rawText) {
      return new Response(
        JSON.stringify({
          extracted: EMPTY_EXTRACTED_VALUES,
          references: EMPTY_EXTRACTED_REFERENCES,
          debug: {
            rawText: '',
            parsed: {},
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let parsed = parseGeminiJson(rawText)
    let extractedSource: unknown = parsed
    let referencesSource: unknown = {}

    if (typeof parsed.extracted !== 'undefined') {
      extractedSource = parsed.extracted
    }

    if (typeof parsed.references !== 'undefined') {
      referencesSource = parsed.references
    }

    let extracted = normalizeExtractedValues(extractedSource)
    let references = normalizeExtractedReferences(referencesSource)

    const shouldRetry =
      buildQualityScore(extracted, references) <= 4 ||
      (rawText.startsWith('{') && !rawText.endsWith('}')) ||
      finishReason === 'MAX_TOKENS'

    if (shouldRetry) {
      const retryResponse = await callGemini(`${prompt}\n\n${RECOVERY_PROMPT}`)
      if (retryResponse.ok) {
        const retryData = await retryResponse.json()
        const retryParts = Array.isArray(retryData?.candidates?.[0]?.content?.parts)
          ? retryData.candidates[0].content.parts
          : []
        const retryRawText = retryParts
          .map((part: { text?: string }) => (typeof part?.text === 'string' ? part.text : ''))
          .join('')
          .trim()

        const retryParsed = parseGeminiJson(retryRawText)
        let retryExtractedSource: unknown = retryParsed
        let retryReferencesSource: unknown = {}

        if (typeof retryParsed.extracted !== 'undefined') {
          retryExtractedSource = retryParsed.extracted
        }

        if (typeof retryParsed.references !== 'undefined') {
          retryReferencesSource = retryParsed.references
        }

        const retryExtracted = normalizeExtractedValues(retryExtractedSource)
        const retryReferences = normalizeExtractedReferences(retryReferencesSource)

        if (buildQualityScore(retryExtracted, retryReferences) > buildQualityScore(extracted, references)) {
          rawText = retryRawText || rawText
          parsed = retryParsed
          extracted = retryExtracted
          references = retryReferences
          finishReason = retryData?.candidates?.[0]?.finishReason ?? finishReason
        }
      }
    }

    return new Response(
      JSON.stringify({
        extracted,
        references,
        debug: {
          rawText,
          parsed,
          finishReason,
          extractedCount: countExtractedValues(extracted),
          referencesCount: countExtractedReferences(references),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao processar documento.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
