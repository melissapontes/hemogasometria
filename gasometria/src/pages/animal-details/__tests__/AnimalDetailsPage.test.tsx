import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('input[type=file] aparece ao abrir o dialog de extração', async () => {
    renderPage()

    // Aguarda carregamento e clica no botão "Extrair novo documento"
    await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Extrair novo documento'),
      )
      expect(btn).toBeDefined()
    })

    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Extrair novo documento'),
    )!

    await userEvent.click(btn)

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).not.toBeNull()
    })
  })

  it('input[type=file] aceita os formatos corretos incluindo image/*', async () => {
    renderPage()

    await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Extrair novo documento'),
      )
      expect(btn).toBeDefined()
    })

    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Extrair novo documento'),
    )!

    await userEvent.click(btn)

    await waitFor(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
      expect(input).not.toBeNull()
      expect(input!.accept).toBe('.pdf,.jpg,.jpeg,.png,.webp,image/*')
    })
  })

  it('input[type=file] está oculto com sr-only (não interfere no layout)', async () => {
    renderPage()

    await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Extrair novo documento'),
      )
      expect(btn).toBeDefined()
    })

    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Extrair novo documento'),
    )!

    await userEvent.click(btn)

    await waitFor(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
      expect(input).not.toBeNull()
      expect(input!.className).toContain('sr-only')
    })
  })
})
