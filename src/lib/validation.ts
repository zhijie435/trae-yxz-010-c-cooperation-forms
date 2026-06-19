import type { FieldError } from './types'
import type { ApplicationFormData } from './types'

export const CREDIT_CODE_RE = /^[0-9A-Z]{18}$/
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
export const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png']
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_FILES = 10
export const MAX_COMPANY_NAME_LENGTH = 100

export function validateCreditCode(code: string): string | null {
  const v = code.trim()
  if (!v) return '请填写统一社会信用代码'
  if (!CREDIT_CODE_RE.test(v)) return '统一社会信用代码应为 18 位大写字母与数字'
  return null
}

export function validateCompanyName(name: string): string | null {
  const v = name.trim()
  if (!v) return '请填写企业全称'
  if (v.length > MAX_COMPANY_NAME_LENGTH) return `企业全称过长（不超过 ${MAX_COMPANY_NAME_LENGTH} 字）`
  return null
}

export function validateCities(cities: string[]): string | null {
  if (!Array.isArray(cities) || cities.length === 0) return '请至少选择一个覆盖城市'
  return null
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `${file.name} 超过 10MB 限制`
  const okType = ALLOWED_FILE_TYPES.includes(file.type)
  const okExt = ALLOWED_EXTS.some((e) => file.name.toLowerCase().endsWith(e))
  if (!okType && !okExt) return `${file.name} 格式不支持（仅 PDF / JPG / PNG）`
  return null
}

export function validateFiles(files: File[]): string | null {
  if (!Array.isArray(files) || files.length === 0) return '请至少上传一个资质附件'
  for (const f of files) {
    const err = validateFile(f)
    if (err) return err
  }
  if (files.length > MAX_FILES) return `最多上传 ${MAX_FILES} 个附件`
  return null
}

export function validateForm(data: ApplicationFormData): FieldError[] {
  const errors: FieldError[] = []
  const companyNameErr = validateCompanyName(data.companyName)
  if (companyNameErr) errors.push({ field: 'companyName', message: companyNameErr })
  const creditCodeErr = validateCreditCode(data.creditCode)
  if (creditCodeErr) errors.push({ field: 'creditCode', message: creditCodeErr })
  const citiesErr = validateCities(data.cities)
  if (citiesErr) errors.push({ field: 'cities', message: citiesErr })
  const filesErr = validateFiles(data.files)
  if (filesErr) errors.push({ field: 'attachments', message: filesErr })
  return errors
}

export function isFormValid(data: ApplicationFormData): boolean {
  return validateForm(data).length === 0
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fieldError(errors: FieldError[], field: string): string {
  return errors.find((e) => e.field === field)?.message ?? ''
}

export function normalizeCreditCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, '')
}
