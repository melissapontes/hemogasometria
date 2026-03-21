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
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_5%_-10%,rgba(6,182,212,0.22),transparent_38%),radial-gradient(circle_at_95%_108%,rgba(16,185,129,0.2),transparent_30%),linear-gradient(180deg,#f8fbff,#edf4ff_60%,#eef8f9)] px-3 py-6 sm:px-6">
      <Card className="w-full max-w-md border-cyan-100 bg-white/95 shadow-[0_18px_60px_-26px_rgba(2,44,68,0.45)]">
        <CardHeader className="space-y-1 px-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Gasometria MAE</p>
          <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
          <p className="text-sm text-slate-500">Acesse o app e acompanhe os exames com seguranca.</p>
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
