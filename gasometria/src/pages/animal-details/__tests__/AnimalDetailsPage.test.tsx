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

function findExtractLabel(): HTMLLabelElement | undefined {
  return Array.from(document.querySelectorAll('label')).find(
    (l) => l.textContent?.includes('Extrair novo documento'),
  )
}

// ── Testes ─────────────────────────────────────────────────────────────────

describe('AnimalDetailsPage — input de arquivo (mobile-safe)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('botão "Extrair novo documento" é um <label> contendo input[type=file]', async () => {
    renderPage()

    await waitFor(() => {
      const label = findExtractLabel()
      expect(label).toBeDefined()
      const input = label!.querySelector('input[type="file"]')
      expect(input).not.toBeNull()
    })
  })

  it('input[type=file] dentro do label aceita formatos corretos incluindo image/*', async () => {
    renderPage()

    await waitFor(() => {
      const label = findExtractLabel()
      expect(label).toBeDefined()
      const input = label!.querySelector('input[type="file"]') as HTMLInputElement
      expect(input.accept).toBe('.pdf,.jpg,.jpeg,.png,.webp,image/*')
    })
  })

  it('input[type=file] está oculto com sr-only', async () => {
    renderPage()

    await waitFor(() => {
      const label = findExtractLabel()
      expect(label).toBeDefined()
      const input = label!.querySelector('input[type="file"]') as HTMLInputElement
      expect(input.className).toContain('sr-only')
    })
  })
})
