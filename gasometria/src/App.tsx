import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Card, CardBody } from './components/ui'
import { useAuth } from './auth/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AnimalDetailsPage } from './pages/animal-details'
import { DashboardPage } from './pages/dashboard'
import { LoginPage } from './pages/login'
import { TermsPage } from './pages/terms/TermsPage'

type PublicRouteProps = {
  children: ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#36494f] px-4">
        <Card className="w-full max-w-md border-slate-200 bg-white/90 shadow-xl">
          <CardBody className="flex flex-row items-center justify-center gap-3 p-8 text-slate-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
            Carregando sessao...
          </CardBody>
        </Card>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:animalId"
        element={
          <ProtectedRoute>
            <AnimalDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
