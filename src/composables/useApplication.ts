import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

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
    const fd = new FormData()
    fd.append('companyName', payload.companyName)
    fd.append('creditCode', payload.creditCode)
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
