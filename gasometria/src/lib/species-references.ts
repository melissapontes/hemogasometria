type ReferenceRange = {
  raw: string | null
  min: number | null
  max: number | null
}

type PartialSpeciesReferences = Partial<Record<string, ReferenceRange>>

const DOG_REFERENCES: PartialSpeciesReferences = {
  ph:          { raw: '7,35–7,44', min: 7.35, max: 7.44 },
  pco2:        { raw: '32–40',     min: 32,   max: 40   },
  po2:         { raw: '47,9–56,3', min: 47.9, max: 56.3 },
  be:          { raw: '-5–+5',     min: -5,   max: 5    },
  hco3:        { raw: '18–26',     min: 18,   max: 26   },
  na:          { raw: '140,3–153,9', min: 140.3, max: 153.9 },
  k:           { raw: '3,8–5,6',  min: 3.8,  max: 5.6  },
  ica:         { raw: '1,18–1,4', min: 1.18, max: 1.4  },
}

function normalizeSpeciesKey(animalTypeName: string): string {
  return animalTypeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function getSpeciesDefaultReferences(animalTypeName: string | null): PartialSpeciesReferences {
  if (!animalTypeName) return {}
  const key = normalizeSpeciesKey(animalTypeName)
  if (key === 'cao' || key === 'canina' || key === 'cachorro') return DOG_REFERENCES
  return {}
}

export function mergeWithDefaults(
  extracted: Record<string, ReferenceRange>,
  defaults: PartialSpeciesReferences,
): Record<string, ReferenceRange> {
  const result: Record<string, ReferenceRange> = { ...extracted }
  for (const key of Object.keys(defaults)) {
    const current = result[key]
    if (!current || (current.min === null && current.max === null && current.raw === null)) {
      result[key] = defaults[key]!
    }
  }
  return result
}
