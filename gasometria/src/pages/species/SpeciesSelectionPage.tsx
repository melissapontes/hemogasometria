import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { HamburgerMenu } from '../../components/HamburgerMenu'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'

type Species = {
  id: number
  label: string
  emoji: string
  subtitle: string
  bg: string
  accent: string
  image?: string
}

const SPECIES: Species[] = [
  {
    id: 1,
    label: 'Cão',
    emoji: '🐕',
    subtitle: 'Espécie canina',
    bg: 'linear-gradient(160deg, #7c3aed 0%, #4f46e5 50%, #1e3a5f 100%)',
    accent: '#a78bfa',
    image: '/species/cao.png',
  },
  {
    id: 2,
    label: 'Gato',
    emoji: '🐈',
    subtitle: 'Espécie felina',
    bg: 'linear-gradient(160deg, #be185d 0%, #9d174d 50%, #1e1b4b 100%)',
    accent: '#f9a8d4',
    image: '/species/gato.png',
  },
  {
    id: 3,
    label: 'Cavalo',
    emoji: '🐎',
    subtitle: 'Espécie equina',
    bg: 'linear-gradient(160deg, #0369a1 0%, #0c4a6e 50%, #0f172a 100%)',
    accent: '#7dd3fc',
    image: '/species/cavalo.png',
  },
  {
    id: 4,
    label: 'Boi',
    emoji: '🐄',
    subtitle: 'Espécie bovina',
    bg: 'linear-gradient(160deg, #15803d 0%, #166534 50%, #052e16 100%)',
    accent: '#86efac',
    image: '/species/boi.png',
  },
]

export function SpeciesSelectionPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    function handleScroll() {
      if (!container) return
      const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-species-card]'))
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2
      let closestIdx = 0
      let closestDist = Infinity
      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const dist = Math.abs(containerCenter - cardCenter)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = i
        }
      })
      activeIndexRef.current = closestIdx
      setActiveIndex(closestIdx)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(index: number) {
    const container = scrollRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLElement>('[data-species-card]')
    const card = cards[index]
    if (!card) return
    const containerRect = container.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const offset = cardRect.left - containerRect.left - (containerRect.width - cardRect.width) / 2
    container.scrollBy({ left: offset, behavior: 'smooth' })
  }

  function handleCardClick(idx: number, speciesId: number) {
    if (activeIndexRef.current === idx) {
      navigate(`/dashboard/${speciesId}`)
    } else {
      scrollTo(idx)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden" style={{ background: '#0f0f13' }}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <BloodDropIcon size={28} />
          <p className="text-lg font-bold tracking-[0.18em] text-white">GasoVet</p>
        </div>
        <HamburgerMenu onSignOut={signOut} />
      </header>

      {/* Title */}
      <div className="shrink-0 px-5 pb-5 pt-2">
        <h1 className="text-2xl font-bold text-white">Selecione a espécie</h1>
        <p className="mt-0.5 text-sm text-white/50">Deslize para navegar</p>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-6"
        style={{
          paddingLeft: 'max(10vw, calc(50% - 170px))',
          paddingRight: 'max(10vw, calc(50% - 170px))',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {SPECIES.map((species, idx) => (
          <div
            key={species.id}
            data-species-card
            className="relative shrink-0 snap-center overflow-hidden rounded-[2.5rem] transition-all duration-300"
            style={{
              width: '80vw',
              maxWidth: 340,
              minHeight: 480,
              background: species.bg,
              opacity: activeIndex === idx ? 1 : 0.55,
              transform: activeIndex === idx ? 'scale(1)' : 'scale(0.93)',
              boxShadow:
                activeIndex === idx
                  ? `0 32px 80px -12px ${species.accent}55, 0 0 0 1px ${species.accent}22`
                  : '0 8px 32px -8px rgba(0,0,0,0.6)',
            }}
          >
            {/* Background image */}
            {species.image && (
              <img
                src={species.image}
                alt={species.label}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
              />
            )}

            {/* Bottom gradient overlay for text legibility */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: species.image
                  ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)'
                  : 'none',
              }}
            />

            {/* Content */}
            <button
              type="button"
              className="relative flex h-full w-full flex-col items-center justify-between p-8 text-left"
              style={{ minHeight: 480 }}
              onClick={() => handleCardClick(idx, species.id)}
            >
              {/* Top badge */}
              <div
                className="self-end rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: `${species.accent}25`, color: species.accent }}
              >
                {species.subtitle}
              </div>

              {/* Emoji — only when no image */}
              {!species.image && (
                <span
                  className="block text-center transition-all duration-300"
                  style={{
                    fontSize: activeIndex === idx ? '7rem' : '5rem',
                    filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
                  }}
                  role="img"
                  aria-label={species.label}
                >
                  {species.emoji}
                </span>
              )}

              {/* Spacer when image is present */}
              {species.image && <div className="flex-1" />}

              {/* Bottom info */}
              <div className="w-full">
                <p className="text-3xl font-bold text-white">{species.label}</p>
                <p className="mt-1 text-sm" style={{ color: species.accent }}>
                  {species.subtitle}
                </p>

                {activeIndex === idx && (
                  <div
                    className="mt-4 flex items-center justify-center rounded-2xl py-3 text-sm font-semibold text-white"
                    style={{ background: `${species.accent}30`, border: `1px solid ${species.accent}40` }}
                  >
                    Ver pacientes →
                  </div>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex shrink-0 items-center justify-center gap-2 pb-8">
        {SPECIES.map((species, idx) => (
          <button
            key={species.id}
            type="button"
            aria-label={`Selecionar ${species.label}`}
            onClick={() => scrollTo(idx)}
            className="transition-all duration-300"
            style={{
              width: activeIndex === idx ? 28 : 8,
              height: 8,
              borderRadius: 999,
              background: activeIndex === idx ? species.accent : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </main>
  )
}
