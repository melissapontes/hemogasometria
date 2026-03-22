import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { clearStoredAuthSession, supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let isRecoveringSession = false

    function isInvalidRefreshTokenError(message?: string): boolean {
      if (!message) {
        return false
      }

      const normalizedMessage = message.toLowerCase()
      return (
        normalizedMessage.includes('invalid refresh token') ||
        normalizedMessage.includes('refresh token not found')
      )
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (!error) {
        setSession(data.session)
      } else if (isInvalidRefreshTokenError(error.message) && !isRecoveringSession) {
        isRecoveringSession = true
        clearStoredAuthSession()
        await supabase.auth.signOut({ scope: 'local' })
        if (isMounted) {
          setSession(null)
        }
      }

      setIsLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      async signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        return { error: error?.message ?? null }
      },
      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider')
  }

  return context
}
