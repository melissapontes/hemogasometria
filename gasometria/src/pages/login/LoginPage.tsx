import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { TextInput } from '../../components/ui'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'
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

  if (user) return <Navigate to={redirectTo} replace />

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (result.error) {
      setError('Não foi possível entrar. Verifique email e senha.')
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-3 py-6 sm:px-6"
      style={{
        backgroundImage: "url('/bglogin.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 45%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8"
        style={{ background: 'rgba(15,15,19,0.72)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <BloodDropIcon size={40} className="mb-2" />
          <p className="text-2xl font-bold tracking-widest text-white">GasoVet</p>
        </div>

        <h1 className="mb-4 text-base font-semibold text-white/80">Entrar</h1>

        <form className="grid gap-4" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70" htmlFor="login-email">Email</label>
            <TextInput
              autoComplete="email"
              id="login-email"
              placeholder="voce@exemplo.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70" htmlFor="login-password">Senha</label>
            <TextInput
              autoComplete="current-password"
              id="login-password"
              placeholder="Digite sua senha"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white/80 transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-white/50">
        <Link className="text-white/80 underline hover:text-white" to="/terms">Termos de Uso</Link>
        {' · '}
        <Link className="text-white/80 underline hover:text-white" to="/privacy">Política de Privacidade</Link>
      </p>
    </main>
  )
}
