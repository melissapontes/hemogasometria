CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  crmv TEXT,
  estado TEXT,
  foto_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own profile photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone read profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users delete own profile photo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
