// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function getAuthStorageKey(): string | null {
  if (!supabaseUrl) {
    return null
  }

  try {
    const hostname = new URL(supabaseUrl).hostname
    const projectRef = hostname.split('.')[0]
    return projectRef ? `sb-${projectRef}-auth-token` : null
  } catch {
    return null
  }
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  const authStorageKey = getAuthStorageKey()
  if (authStorageKey) {
    window.localStorage.removeItem(authStorageKey)
  }
}
