import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, TextInput } from '../../components/ui'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'
import { useAuth } from '../../auth/AuthProvider'

type Tab = 'login' | 'cadastro'

function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesPassou = hoje.getMonth() > nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate())
  if (!mesPassou) idade--
  return idade
}

export function LoginPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  if (user) return <Navigate to={redirectTo} replace />

  function switchTab(newTab: Tab) {
    setTab(newTab)
    setError('')
    setSuccessMessage('')
  }

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

  async function handleCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!dataNascimento) {
      setError('Informe sua data de nascimento.')
      return
    }

    const idade = calcularIdade(dataNascimento)
    if (idade < 18) {
      setError('O GasoVet é destinado exclusivamente a profissionais com 18 anos ou mais.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setIsSubmitting(true)
    const result = await signUp(email, password, dataNascimento)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
    setEmail('')
    setPassword('')
    setDataNascimento('')
  }

  const maxBirthDate = new Date()
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18)
  const maxDateStr = maxBirthDate.toISOString().split('T')[0]

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#36494f] px-3 py-6 sm:px-6">
      <Card className="w-full max-w-md border-cyan-100 bg-white/95 shadow-[0_18px_60px_-26px_rgba(2,44,68,0.45)]">
        <CardHeader className="space-y-1 px-6 pb-0">
          <div className="flex flex-col items-center text-center">
            <BloodDropIcon size={40} className="mb-2" />
            <p className="text-2xl font-bold tracking-widest" style={{ color: '#39484f' }}>GasoVet</p>
          </div>

          <h1 className="mt-3 text-base font-semibold text-[#4d4d4d]">Entrar</h1>
        </CardHeader>

        <CardBody className="px-6 pb-6 pt-4">
          {tab === 'login' ? (
            <form className="grid gap-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="login-email">Email</label>
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
                <label className="text-sm font-medium text-slate-700" htmlFor="login-password">Senha</label>
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

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

              <Button disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleCadastro}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="cad-email">Email</label>
                <TextInput
                  autoComplete="email"
                  id="cad-email"
                  placeholder="voce@exemplo.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="cad-password">
                  Senha <span className="text-xs font-normal text-slate-400">(mínimo 6 caracteres)</span>
                </label>
                <TextInput
                  autoComplete="new-password"
                  id="cad-password"
                  placeholder="Crie uma senha"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="cad-nascimento">
                  Data de nascimento <span className="text-xs font-normal text-slate-400">(obrigatório — 18+ anos)</span>
                </label>
                <TextInput
                  id="cad-nascimento"
                  max={maxDateStr}
                  required
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {successMessage ? <p className="text-sm font-medium text-green-600">{successMessage}</p> : null}

              <Button disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <p className="text-center text-xs text-slate-400">
                Ao criar sua conta, você declara ser um profissional veterinário habilitado e concorda com os{' '}
                <Link className="text-[#36494f] underline" to="/terms">Termos de Uso</Link>
                {' '}e a{' '}
                <Link className="text-[#36494f] underline" to="/privacy">Política de Privacidade</Link>.
              </p>
            </form>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-center text-xs text-white/50">
        <Link className="text-white/80 underline hover:text-white" to="/terms">Termos de Uso</Link>
        {' · '}
        <Link className="text-white/80 underline hover:text-white" to="/privacy">Política de Privacidade</Link>
      </p>
    </main>
  )
}
