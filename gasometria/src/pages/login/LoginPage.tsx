import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, TextInput } from '../../components/ui'
import { useAuth } from '../../auth/AuthProvider'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (result.error) {
      setError('Nao foi possivel entrar. Verifique email e senha.')
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-6">
      <Card className="w-full max-w-md border-sky-100 bg-white/95 shadow-2xl">
        <CardHeader className="space-y-1 px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Gasometria MAE</p>
          <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
          <p className="text-sm text-slate-500">Acesse o app para acompanhar os exames.</p>
        </CardHeader>

        <CardBody className="px-6 pb-6 pt-4">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <TextInput
                autoComplete="email"
                id="email"
                placeholder="voce@exemplo.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <TextInput
                autoComplete="current-password"
                id="password"
                placeholder="Digite sua senha"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <Button disabled={isSubmitting} type="submit" variant="primary">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  )
}
