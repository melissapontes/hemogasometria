INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-documents', 'exam-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own exam documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own exam documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own exam documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'exam-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
