export type SpeciesTheme = {
  id: number
  label: string
  subtitle: string
  bg: string
  accent: string
  chartColor?: string
  image: string
}

export const SPECIES_THEMES: SpeciesTheme[] = [
  {
    id: 1,
    label: 'Cão',
    subtitle: 'Espécie canina',
    bg: 'linear-gradient(160deg, #7c3aed 0%, #4f46e5 50%, #1e3a5f 100%)',
    accent: '#a78bfa',
    chartColor: '#252034',
    image: '/species/cao.png',
  },
  {
    id: 2,
    label: 'Gato',
    subtitle: 'Espécie felina',
    bg: 'linear-gradient(160deg, #be185d 0%, #9d174d 50%, #1e1b4b 100%)',
    accent: '#f9a8d4',
    chartColor: '#382c37',
    image: '/species/gato.png',
  },
  {
    id: 3,
    label: 'Cavalo',
    subtitle: 'Espécie equina',
    bg: 'linear-gradient(160deg, #0369a1 0%, #0c4a6e 50%, #0f172a 100%)',
    accent: '#7dd3fc',
    chartColor: '#2d4858',
    image: '/species/cavalo.png',
  },
  {
    id: 4,
    label: 'Boi',
    subtitle: 'Espécie bovina',
    bg: 'linear-gradient(160deg, #15803d 0%, #166534 50%, #052e16 100%)',
    accent: '#86efac',
    chartColor: '#2f523a',
    image: '/species/boi.png',
  },
]

export function getSpeciesTheme(typeId: string | undefined): SpeciesTheme | null {
  if (!typeId) return null
  return SPECIES_THEMES.find((s) => String(s.id) === typeId) ?? null
}
