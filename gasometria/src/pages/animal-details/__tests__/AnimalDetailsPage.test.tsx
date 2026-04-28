import { render, screen, waitFor } from '@testing-library/react'
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

// Supabase: retorna dados vazios para todas as queries
const mockChain: Record<string, unknown> = {}
const chain = () => mockChain

mockChain.select = chain
mockChain.eq = chain
mockChain.order = chain
mockChain.limit = () => Promise.resolve({ data: [], error: null })
mockChain.maybeSingle = () => Promise.resolve({ data: null, error: null })
mockChain.single = () => Promise.resolve({ data: null, error: null })
mockChain.upsert = chain
mockChain.insert = () => Promise.resolve({ data: null, error: null })
mockChain.delete = chain
mockChain.update = chain

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: () => mockChain,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: () => ({
        createSignedUrl: () => Promise.resolve({ data: null, error: null }),
        upload: () => Promise.resolve({ error: null }),
      }),
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  },
  clearStoredAuthSession: vi.fn(),
}))

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

// ── Testes ─────────────────────────────────────────────────────────────────

describe('AnimalDetailsPage — input de arquivo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('input[type=file] está no DOM quando a página carrega (dialog fechado)', async () => {
    renderPage()

    // Aguarda o carregamento inicial
    await waitFor(() => {
      expect(document.querySelector('input[type="file"]')).not.toBeNull()
    })
  })

  it('input[type=file] fica no DOM mesmo sem interação com o dialog', async () => {
    renderPage()

    await waitFor(() => {
      const fileInputs = document.querySelectorAll('input[type="file"]')
      // Deve haver exatamente 1 input de arquivo — o persistente fora do dialog
      expect(fileInputs).toHaveLength(1)
    })
  })

  it('input[type=file] está oculto visualmente (não interfere no layout)', async () => {
    renderPage()

    await waitFor(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
      expect(input).not.toBeNull()
      // Deve estar escondido por position: fixed fora da tela
      expect(input!.style.position).toBe('fixed')
      expect(input!.style.opacity).toBe('0')
    })
  })

  it('input[type=file] aceita apenas os formatos corretos', async () => {
    renderPage()

    await waitFor(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
      expect(input).not.toBeNull()
      expect(input!.accept).toBe('.pdf,.jpg,.jpeg,.png,.webp')
    })
  })
})
