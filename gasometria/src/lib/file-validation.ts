export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string }

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Arquivo muito grande. Envie no máximo 10MB.' }
  }

  if (!SUPPORTED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { valid: false, error: 'Formato inválido. Use PDF, JPG, PNG ou WEBP.' }
  }

  return { valid: true }
}
