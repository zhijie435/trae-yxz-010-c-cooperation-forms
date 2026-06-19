import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'
import { validateCreditCode, validateFile } from '@/lib/validation'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

export function useApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])

  async function submit(payload: {
    companyName: string
    creditCode: string
    cities: string[]
    files: File[]
  }): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []

    const clientErrors: FieldError[] = []
    const companyName = payload.companyName.trim()
    if (!companyName) clientErrors.push({ field: 'companyName', message: '请填写企业全称' })
    const creditCodeErr = validateCreditCode(payload.creditCode)
    if (creditCodeErr) clientErrors.push({ field: 'creditCode', message: creditCodeErr })
    if (!Array.isArray(payload.cities) || payload.cities.length === 0)
      clientErrors.push({ field: 'cities', message: '请至少选择一个覆盖城市' })
    if (!Array.isArray(payload.files) || payload.files.length === 0) {
      clientErrors.push({ field: 'attachments', message: '请至少上传一个资质附件' })
    } else {
      for (const f of payload.files) {
        const fileErr = validateFile(f)
        if (fileErr) {
          clientErrors.push({ field: 'attachments', message: fileErr })
          break
        }
      }
    }

    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    const fd = new FormData()
    fd.append('companyName', companyName)
    fd.append('creditCode', payload.creditCode.trim())
    fd.append('cities', JSON.stringify(payload.cities))
    for (const f of payload.files) fd.append('attachments', f, f.name)
    try {
      const res = await fetch('/api/apply', { method: 'POST', body: fd })
      const data = (await res.json()) as ApplyApiPayload
      if (data.success && data.applicationNo && data.receivedAt) {
        return { applicationNo: data.applicationNo, receivedAt: data.receivedAt }
      }
      serverErrors.value = data.errors ?? []
      return null
    } catch {
      serverErrors.value = [{ field: 'form', message: '网络异常，请稍后重试' }]
      return null
    } finally {
      submitting.value = false
    }
  }

  async function fetchCities(): Promise<string[]> {
    try {
      const res = await fetch('/api/cities')
      const data = (await res.json()) as { cities?: string[] }
      return data.cities ?? []
    } catch {
      return []
    }
  }

  return { submitting, serverErrors, submit, fetchCities }
}
