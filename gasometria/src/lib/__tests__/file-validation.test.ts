import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE_BYTES, resolveFileMimeType, validateFile } from '../file-validation'

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

describe('validateFile', () => {
  describe('tipos válidos', () => {
    it.each([
      ['application/pdf', 'laudo.pdf'],
      ['image/jpeg', 'foto.jpg'],
      ['image/jpg', 'foto.jpg'],
      ['image/png', 'foto.png'],
      ['image/webp', 'foto.webp'],
    ])('aceita %s', (type, name) => {
      const file = makeFile(name, type, 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })
  })

  describe('tipos inválidos', () => {
    it.each([
      ['video/mp4', 'video.mp4'],
      ['text/plain', 'doc.txt'],
      ['application/zip', 'arquivo.zip'],
      ['image/gif', 'imagem.gif'],
    ])('rejeita %s', (type, name) => {
      const file = makeFile(name, type, 1024)
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toMatch(/Formato inválido/)
      }
    })
  })

  describe('tamanho do arquivo', () => {
    it('aceita arquivo exatamente no limite (10MB)', () => {
      const file = makeFile('laudo.pdf', 'application/pdf', MAX_FILE_SIZE_BYTES)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('rejeita arquivo acima do limite (10MB + 1 byte)', () => {
      const file = makeFile('laudo.pdf', 'application/pdf', MAX_FILE_SIZE_BYTES + 1)
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toMatch(/muito grande/)
      }
    })

    it('rejeita arquivo muito grande independente do tipo', () => {
      const file = makeFile('foto.jpg', 'image/jpeg', MAX_FILE_SIZE_BYTES + 1)
      expect(validateFile(file).valid).toBe(false)
    })

    it('tamanho é verificado antes do tipo', () => {
      const file = makeFile('video.mp4', 'video/mp4', MAX_FILE_SIZE_BYTES + 1)
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toMatch(/muito grande/)
      }
    })
  })

  describe('Android: file.type vazio (câmera / galeria)', () => {
    it('aceita .pdf com type vazio (fallback por extensão)', () => {
      const file = makeFile('laudo.pdf', '', 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('aceita .jpg com type vazio', () => {
      const file = makeFile('foto.jpg', '', 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('aceita .jpeg com type vazio', () => {
      const file = makeFile('foto.jpeg', '', 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('aceita .png com type vazio', () => {
      const file = makeFile('imagem.png', '', 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('aceita .webp com type vazio', () => {
      const file = makeFile('imagem.webp', '', 1024)
      expect(validateFile(file)).toEqual({ valid: true })
    })

    it('rejeita .gif com type vazio (extensão não suportada)', () => {
      const file = makeFile('imagem.gif', '', 1024)
      expect(validateFile(file).valid).toBe(false)
    })

    it('rejeita arquivo sem extensão e type vazio', () => {
      const file = makeFile('arquivo', '', 1024)
      expect(validateFile(file).valid).toBe(false)
    })
  })
})

describe('resolveFileMimeType', () => {
  it('retorna o type informado quando não está vazio', () => {
    const file = makeFile('foto.jpg', 'image/jpeg', 100)
    expect(resolveFileMimeType(file)).toBe('image/jpeg')
  })

  it('resolve pela extensão quando type está vazio', () => {
    const file = makeFile('laudo.pdf', '', 100)
    expect(resolveFileMimeType(file)).toBe('application/pdf')
  })

  it('retorna string vazia para extensão desconhecida com type vazio', () => {
    const file = makeFile('arquivo.xyz', '', 100)
    expect(resolveFileMimeType(file)).toBe('')
  })
})
