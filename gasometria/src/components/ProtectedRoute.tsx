import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Card, CardBody } from './ui'
import { useAuth } from '../auth/AuthProvider'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
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

  return <>{children}</>
}
