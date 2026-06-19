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

    const clientErrors: FieldError[] = []
    const direction = payload.direction?.trim() as SkillDirection
    if (!direction) {
      clientErrors.push({ field: 'direction', message: '请选择技能方向' })
    } else if (direction !== 'hardware' && direction !== 'software') {
      clientErrors.push({ field: 'direction', message: '技能方向无效' })
    }
    if (!Array.isArray(payload.files) || payload.files.length === 0)
      clientErrors.push({ field: 'attachments', message: '请至少上传一个资质附件' })

    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    const fd = new FormData()
    fd.append('direction', direction)
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
