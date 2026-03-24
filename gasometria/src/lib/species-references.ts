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

// Referências equinos — fonte: tabela fornecida por Melissa Pontes (03/2026)
// Obs.: Ca++ na tabela refere-se ao cálcio total (mEq/L), não iCa — omitido pois o app usa iCa (mmol/L)
const HORSE_REFERENCES: PartialSpeciesReferences = {
  ph:        { raw: '7,32–7,44',   min: 7.32,  max: 7.44  },
  pco2:      { raw: '38–46',       min: 38,    max: 46    },
  po2:       { raw: '38–42',       min: 38,    max: 42    },
  be:        { raw: '-5–+5',       min: -5,    max: 5     },
  hco3:      { raw: '24–30',       min: 24,    max: 30    },
  na:        { raw: '132–146',     min: 132,   max: 146   },
  k:         { raw: '2,6–5,0',     min: 2.6,   max: 5.0   },
  cloro:     { raw: '99–109',      min: 99,    max: 109   },
  lactato:   { raw: '1,1–1,8',     min: 1.1,   max: 1.8   },
  anion_gap: { raw: '10–26',       min: 10,    max: 26    },
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
