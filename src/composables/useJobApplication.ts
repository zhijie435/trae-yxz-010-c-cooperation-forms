import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

const PHONE_RE = /^1[3-9]\d{9}$/
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/

function validateContact(value: string): string | null {
  const v = value.trim()
  if (!v) return '请填写联系方式'
  if (/^\d+$/.test(v)) {
    if (!PHONE_RE.test(v)) return '请输入有效的 11 位手机号码'
  } else {
    if (v.length < 6 || v.length > 50) return '微信号/联系方式长度应为 6-50 位'
  }
  return null
}

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

    const clientErrors: FieldError[] = []
    const name = payload.name.trim()
    if (!name) clientErrors.push({ field: 'name', message: '请填写姓名' })
    const phone = payload.phone.trim()
    const phoneErr = validateContact(phone)
    if (phoneErr) clientErrors.push({ field: 'phone', message: phoneErr })
    const email = payload.email.trim()
    if (!email) {
      clientErrors.push({ field: 'email', message: '请填写邮箱' })
    } else if (!EMAIL_RE.test(email)) {
      clientErrors.push({ field: 'email', message: '邮箱格式不正确' })
    }
    const city = payload.city.trim()
    if (!city) clientErrors.push({ field: 'city', message: '请填写意向城市' })
    const expectedSalary = payload.expectedSalary.trim()
    if (!expectedSalary) clientErrors.push({ field: 'expectedSalary', message: '请填写期望薪资' })

    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    try {
      const res = await fetch('/api/job-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, city, expectedSalary }),
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
