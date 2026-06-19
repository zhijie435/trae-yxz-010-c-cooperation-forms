import type { FieldError } from './types'

export const CREDIT_CODE_RE = /^[0-9A-Z]{18}$/
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
export const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png']
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_FILES = 10

export function validateCreditCode(code: string): string | null {
  const v = code.trim()
  if (!v) return '请填写统一社会信用代码'
  if (!CREDIT_CODE_RE.test(v)) return '统一社会信用代码应为 18 位大写字母与数字'
  return null
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `${file.name} 超过 10MB 限制`
  const okType = ALLOWED_FILE_TYPES.includes(file.type)
  const okExt = ALLOWED_EXTS.some((e) => file.name.toLowerCase().endsWith(e))
  if (!okType && !okExt) return `${file.name} 格式不支持（仅 PDF / JPG / PNG）`
  return null
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fieldError(errors: FieldError[], field: string): string {
  return errors.find((e) => e.field === field)?.message ?? ''
}
