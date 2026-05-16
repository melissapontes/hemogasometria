import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnimalDetailsPage } from '../AnimalDetailsPage'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../../auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-test-id' },
    signOut: vi.fn(),
    isLoading: false,
  }),
}))

vi.mock('../../../components/HamburgerMenu', () => ({
  HamburgerMenu: () => null,
}))

vi.mock('../../../lib/error-reporter', () => ({
  reportError: vi.fn(),
}))

vi.mock('../../../lib/supabase', () => {
  const animalData = {
    id: 'animal-test-id',
    nome: 'Thor',
    sexo: 'Macho',
    idade_anos: 5,
    peso_kg: null,
    observacoes: null,
    created_at: '2024-01-01T00:00:00Z',
    animal_type_id: 1,
    animal_types: { nome: 'Canina' },
  }

  // Chain que retorna lista vazia
  const empty: Record<string, unknown> = {}
  const ce = () => empty
  empty.select = ce
  empty.eq = ce
  empty.order = ce
  empty.limit = () => Promise.resolve({ data: [], error: null })
  empty.maybeSingle = () => Promise.resolve({ data: null, error: null })
  empty.single = () => Promise.resolve({ data: null, error: null })
  empty.upsert = ce
  empty.insert = () => Promise.resolve({ data: null, error: null })
  empty.delete = ce
  empty.update = ce

  // Chain específico para animals
  const animal: Record<string, unknown> = {}
  const ca = () => animal
  animal.select = ca
  animal.eq = ca
  animal.maybeSingle = () => Promise.resolve({ data: animalData, error: null })

  return {
    supabase: {
      from: (table: string) => (table === 'animals' ? animal : empty),
      auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
      storage: {
        from: () => ({
          createSignedUrl: () => Promise.resolve({ data: null, error: null }),
          upload: () => Promise.resolve({ error: null }),
        }),
      },
      functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
    },
    clearStoredAuthSession: vi.fn(),
  }
})

// ── Helper ─────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/animals/animal-test-id']}>
      <Routes>
        <Route path="/animals/:animalId" element={<AnimalDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ── Testes: input de arquivo fora do dialog (prevenção do bug Android) ─────

describe('AnimalDetailsPage — input de arquivo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('input[type=file] está no DOM assim que o animal carrega', async () => {
    renderPage()
    await waitFor(
      () => {
        expect(document.querySelector('input[type="file"]')).not.toBeNull()
      },
      { timeout: 3000 },
    )
  })

  it('há exatamente 1 input[type=file] na página (nenhum dentro do dialog)', async () => {
    renderPage()
    await waitFor(
      () => {
        expect(document.querySelectorAll('input[type="file"]')).toHaveLength(1)
      },
      { timeout: 3000 },
    )
  })

  it('input[type=file] aceita PDF, imagens e image/* para câmera Android', async () => {
    renderPage()
    await waitFor(
      () => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
        expect(input).not.toBeNull()
        expect(input!.accept).toBe('.pdf,.jpg,.jpeg,.png,.webp,image/*')
      },
      { timeout: 3000 },
    )
  })

  it('input[type=file] é invisível mas NÃO usa display:none nem visibility:hidden', async () => {
    // display:none e visibility:hidden impedem o clique em alguns browsers móveis
    renderPage()
    await waitFor(
      () => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
        expect(input).not.toBeNull()
        expect(input!.style.display).not.toBe('none')
        expect(input!.style.visibility).not.toBe('hidden')
      },
      { timeout: 3000 },
    )
  })

  it('input[type=file] não está dentro de um dialog aberto', async () => {
    renderPage()
    await waitFor(
      () => {
        const input = document.querySelector('input[type="file"]')
        expect(input).not.toBeNull()
        const dialog = document.querySelector('[role="dialog"]')
        if (dialog) {
          expect(dialog.contains(input)).toBe(false)
        }
      },
      { timeout: 3000 },
    )
  })
})
