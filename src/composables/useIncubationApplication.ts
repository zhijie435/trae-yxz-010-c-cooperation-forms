import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

export function useIncubationApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])

  async function submit(payload: {
    projectIntro: string
    incubationNeeds: string
  }): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []

    const clientErrors: FieldError[] = []
    const projectIntro = payload.projectIntro.trim()
    if (!projectIntro) clientErrors.push({ field: 'projectIntro', message: '请填写项目介绍' })
    const incubationNeeds = payload.incubationNeeds.trim()
    if (!incubationNeeds) clientErrors.push({ field: 'incubationNeeds', message: '请填写孵化需求' })

    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    try {
      const res = await fetch('/api/incubation-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIntro, incubationNeeds }),
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
