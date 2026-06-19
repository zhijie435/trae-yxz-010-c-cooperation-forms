import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

export function useJobApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])

  async function submit(payload: {
    name: string
    phone: string
    email: string
    city: string
    expectedSalary: string
  }): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []
    try {
      const res = await fetch('/api/job-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
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

  return { submitting, serverErrors, submit }
}
