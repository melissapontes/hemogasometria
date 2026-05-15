export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/**
 * Resolve the effective MIME type for a File.
 *
 * On many mobile browsers (especially Android) the `file.type` property can be
 * an empty string when the user captures a photo with the camera or picks from
 * the gallery.  In that case we fall back to the file extension so the upload
 * is not incorrectly rejected.
 */
export function resolveFileMimeType(file: File): string {
  const reported = file.type?.toLowerCase().trim()
  if (reported) {
    return reported
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TO_MIME[ext] ?? ''
}

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string }

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Arquivo muito grande. Envie no máximo 10MB.' }
  }

  const mime = resolveFileMimeType(file)
  if (!SUPPORTED_MIME_TYPES.has(mime)) {
    return { valid: false, error: 'Formato inválido. Use PDF, JPG, PNG ou WEBP.' }
  }

  return { valid: true }
}
