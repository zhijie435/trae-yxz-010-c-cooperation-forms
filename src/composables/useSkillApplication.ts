import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

export type SkillDirection = 'hardware' | 'software'

export function useSkillApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])

  async function submit(payload: {
    direction: SkillDirection
    files: File[]
  }): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []
    const fd = new FormData()
    fd.append('direction', payload.direction)
    for (const f of payload.files) fd.append('attachments', f, f.name)
    try {
      const res = await fetch('/api/skill-apply', { method: 'POST', body: fd })
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
