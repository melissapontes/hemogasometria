import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { Card, CardBody } from './ui'
import { useAuth } from '../auth/AuthProvider'
import { supabase } from '../lib/supabase'
import { TermsConsentModal } from './TermsConsentModal'

type ProtectedRouteProps = {
  children: ReactNode
}

type TermsStatus = 'loading' | 'accepted' | 'pending'

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const [termsStatus, setTermsStatus] = useState<TermsStatus>('loading')

  useEffect(() => {
    if (!user) return
    void checkTermsAccepted()
  }, [user])

  async function checkTermsAccepted() {
    setTermsStatus('loading')
    const { data } = await supabase
      .from('profiles')
      .select('terms_accepted_at')
      .eq('id', user!.id)
      .maybeSingle()

    setTermsStatus(data?.terms_accepted_at ? 'accepted' : 'pending')
  }

  async function handleAcceptTerms() {
    await supabase.from('profiles').upsert({
      id: user!.id,
      terms_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setTermsStatus('accepted')
  }

  if (isLoading || (user && termsStatus === 'loading')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#303136] px-4">
        <Card className="w-full max-w-md border-slate-200 bg-white/90 shadow-xl">
          <CardBody className="flex flex-row items-center justify-center gap-3 p-8 text-slate-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
            Carregando sessao...
          </CardBody>
        </Card>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (termsStatus === 'pending') {
    return <TermsConsentModal onAccept={handleAcceptTerms} />
  }

  return <>{children}</>
}
