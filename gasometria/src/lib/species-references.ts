type ReferenceRange = {
  raw: string | null
  min: number | null
  max: number | null
}

type PartialSpeciesReferences = Partial<Record<string, ReferenceRange>>

const DOG_REFERENCES: PartialSpeciesReferences = {
  ph:        { raw: '7,35–7,44',   min: 7.35,  max: 7.44  },
  pco2:      { raw: '32–40',       min: 32,    max: 40    },
  po2:       { raw: '47,9–56,3',   min: 47.9,  max: 56.3  },
  be:        { raw: '-5–+5',       min: -5,    max: 5     },
  hco3:      { raw: '18–26',       min: 18,    max: 26    },
  na:        { raw: '140,3–153,9', min: 140.3, max: 153.9 },
  k:         { raw: '3,8–5,6',     min: 3.8,   max: 5.6   },
  ica:       { raw: '1,18–1,4',    min: 1.18,  max: 1.4   },
  // Torrente Artero, Vet Clin Small Anim (2016)
  anion_gap: { raw: '12–24',       min: 12,    max: 24    },
}

// Referências equinos — fonte: Kaneko, Clinical Biochemistry of Domestic Animals (2008)
const HORSE_REFERENCES: PartialSpeciesReferences = {
  ph:        { raw: '7,35–7,45',  min: 7.35,  max: 7.45  },
  pco2:      { raw: '40',         min: 40,    max: 40    },
  po2:       { raw: '90–100',     min: 90,    max: 100   },
  tco2:      { raw: '26',         min: 26,    max: 26    },
  hco3:      { raw: '24',         min: 24,    max: 24    },
  be:        { raw: '-3–3',       min: -3,    max: 3     },
  so2:       { raw: '97–100',     min: 97,    max: 100   },
  na:        { raw: '135–145',    min: 135,   max: 145   },
  k:         { raw: '3–4',        min: 3,     max: 4     },
  cloro:     { raw: '95–105',     min: 95,    max: 105   },
  ica:       { raw: '1,3–1,5',    min: 1.3,   max: 1.5   },
  anion_gap: { raw: '8–15',       min: 8,     max: 15    },
}

// Referências do gato: usar as do cão temporariamente até referência específica ser fornecida,
// exceto Ânion Gap que tem fonte própria (Torrente Artero, Vet Clin Small Anim, 2016)
const CAT_REFERENCES: PartialSpeciesReferences = {
  ph:        { raw: '7,35–7,44',   min: 7.35,  max: 7.44  },
  pco2:      { raw: '32–40',       min: 32,    max: 40    },
  po2:       { raw: '47,9–56,3',   min: 47.9,  max: 56.3  },
  be:        { raw: '-5–+5',       min: -5,    max: 5     },
  hco3:      { raw: '18–26',       min: 18,    max: 26    },
  na:        { raw: '140,3–153,9', min: 140.3, max: 153.9 },
  k:         { raw: '3,8–5,6',     min: 3.8,   max: 5.6   },
  ica:       { raw: '1,18–1,4',    min: 1.18,  max: 1.4   },
  anion_gap: { raw: '13–27',       min: 13,    max: 27    },
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
  if (key === 'gato' || key === 'felina' || key === 'felino') return CAT_REFERENCES
  if (key === 'cavalo' || key === 'equino' || key === 'equina' || key === 'egua') return HORSE_REFERENCES
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
