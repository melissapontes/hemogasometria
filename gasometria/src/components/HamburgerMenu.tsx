import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Menu, X, Camera, Settings, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { supabase } from '../lib/supabase'
import { Button } from './ui/Button'

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

type Profile = {
  nome: string
  crmv: string
  estado: string
  foto_url: string
}

export function HamburgerMenu({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>({ nome: '', crmv: '', estado: '', foto_url: '' })
  const [savedProfile, setSavedProfile] = useState<Profile>({ nome: '', crmv: '', estado: '', foto_url: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasChanges =
    profile.nome !== savedProfile.nome ||
    profile.crmv !== savedProfile.crmv ||
    profile.estado !== savedProfile.estado ||
    profile.foto_url !== savedProfile.foto_url

  useEffect(() => {
    if (isOpen && user) void loadProfile()
  }, [isOpen, user])

  async function loadProfile() {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('nome, crmv, estado, foto_url')
      .eq('id', user.id)
      .maybeSingle()
    if (data) {
      const loaded = {
        nome: data.nome ?? '',
        crmv: data.crmv ?? '',
        estado: data.estado ?? '',
        foto_url: data.foto_url ?? '',
      }
      setProfile(loaded)
      setSavedProfile(loaded)
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setProfile((prev) => ({ ...prev, foto_url: urlData.publicUrl + '?t=' + Date.now() }))
    }
    setUploadingPhoto(false)
  }

  async function handleSave() {
    if (!user) return
    setIsSaving(true)
    await supabase.from('profiles').upsert({
      id: user.id,
      nome: profile.nome,
      crmv: profile.crmv,
      estado: profile.estado,
      foto_url: profile.foto_url,
      updated_at: new Date().toISOString(),
    })
    setSavedProfile({ ...profile })
    setIsSaving(false)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  return (
    <>
      <button
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={20} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsOpen(false)} />
      ) : null}

      <div className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col bg-[#3a3b40] shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="font-semibold text-white">Menu</span>
          <button
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Profile display */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <button
              className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 text-slate-400 hover:opacity-80"
              disabled={uploadingPhoto}
              title="Alterar foto"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile.foto_url ? (
                <img alt="Foto de perfil" className="h-full w-full object-cover" src={profile.foto_url} />
              ) : (
                <Camera size={22} />
              )}
              {uploadingPhoto ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                </div>
              ) : null}
              <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-white shadow">
                <Camera size={10} />
              </div>
            </button>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handlePhotoChange}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {profile.nome || 'Sem nome'}
              </p>
              <p className="truncate text-sm text-slate-300">{user?.email}</p>
            </div>
          </div>

          {/* References */}
          <div className="px-4 pt-4">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-slate-300">Conteúdo</p>
            <Link
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
              to="/references"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen size={17} className="shrink-0 text-slate-400" />
              Referências bibliográficas
            </Link>
          </div>

          {/* Settings */}
          <div className="px-4 pt-4">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-slate-300">Conta</p>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <Settings size={17} className="shrink-0 text-slate-400" />
              Configurações do perfil
              {settingsOpen ? (
                <ChevronUp size={15} className="ml-auto text-slate-400" />
              ) : (
                <ChevronDown size={15} className="ml-auto text-slate-400" />
              )}
            </button>

            {settingsOpen && (
              <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="profile-nome">Nome</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                    id="profile-nome"
                    placeholder="Seu nome"
                    type="text"
                    value={profile.nome}
                    onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="profile-crmv">CRMV</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                    id="profile-crmv"
                    placeholder="Ex.: 12345"
                    type="text"
                    value={profile.crmv}
                    onChange={(e) => setProfile((p) => ({ ...p, crmv: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="profile-estado">Estado</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                    id="profile-estado"
                    value={profile.estado}
                    onChange={(e) => setProfile((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {BR_STATES.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <Button
                  className="w-full"
                  disabled={isSaving || !hasChanges}
                  type="button"
                  variant="primary"
                  onClick={() => void handleSave()}
                >
                  {isSaving ? 'Salvando...' : savedMessage ? 'Salvo!' : 'Salvar'}
                </Button>
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4 space-y-3">
          <div className="flex justify-center gap-4">
            <Link className="text-sm text-slate-300 hover:text-white hover:underline" to="/terms" onClick={() => setIsOpen(false)}>
              Termos de Uso
            </Link>
            <Link className="text-sm text-slate-300 hover:text-white hover:underline" to="/privacy" onClick={() => setIsOpen(false)}>
              Privacidade
            </Link>
          </div>
          <Button className="w-full" type="button" onClick={() => void onSignOut()}>
            Sair
          </Button>
        </div>

      </div>
    </>
  )
}
