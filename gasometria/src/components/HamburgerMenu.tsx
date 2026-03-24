import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Menu, X, Camera } from 'lucide-react'
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
  const [profile, setProfile] = useState<Profile>({ nome: '', crmv: '', estado: '', foto_url: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      void loadProfile()
    }
  }, [isOpen, user])

  async function loadProfile() {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('nome, crmv, estado, foto_url')
      .eq('id', user.id)
      .maybeSingle()
    if (data) {
      setProfile({
        nome: data.nome ?? '',
        crmv: data.crmv ?? '',
        estado: data.estado ?? '',
        foto_url: data.foto_url ?? '',
      })
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
      const fotoUrl = urlData.publicUrl
      setProfile((prev) => ({ ...prev, foto_url: fotoUrl }))
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

      {/* Backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <span className="font-semibold text-[#4d4d4d]">Menu</span>
          <button
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile section */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Perfil</p>

          {/* Avatar */}
          <div className="mb-5 flex flex-col items-center gap-2">
            <button
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 text-slate-400 hover:opacity-80"
              disabled={uploadingPhoto}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile.foto_url ? (
                <img
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                  src={profile.foto_url}
                />
              ) : (
                <Camera size={28} />
              )}
              {uploadingPhoto ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                </div>
              ) : null}
            </button>
            <span className="text-xs text-slate-500">Toque para alterar a foto</span>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4d4d4d]" htmlFor="profile-nome">
                Nome
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                id="profile-nome"
                placeholder="Seu nome"
                type="text"
                value={profile.nome}
                onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4d4d4d]" htmlFor="profile-crmv">
                CRMV
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                id="profile-crmv"
                placeholder="Ex.: 12345"
                type="text"
                value={profile.crmv}
                onChange={(e) => setProfile((p) => ({ ...p, crmv: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4d4d4d]" htmlFor="profile-estado">
                Estado
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#4d4d4d] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300"
                id="profile-estado"
                value={profile.estado}
                onChange={(e) => setProfile((p) => ({ ...p, estado: e.target.value }))}
              >
                <option value="">Selecione</option>
                {BR_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <Button
              className="w-full"
              disabled={isSaving}
              type="button"
              variant="primary"
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Salvando...' : savedMessage ? 'Salvo!' : 'Salvar perfil'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-4 space-y-3">
          <Link
            className="block text-center text-xs text-slate-400 hover:text-slate-600 hover:underline"
            to="/terms"
            onClick={() => setIsOpen(false)}
          >
            Termos de Uso
          </Link>
          <Button
            className="w-full"
            type="button"
            onClick={() => void onSignOut()}
          >
            Sair
          </Button>
        </div>
      </div>
    </>
  )
}
