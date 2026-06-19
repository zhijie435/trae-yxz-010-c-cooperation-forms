import { ref } from 'vue'
import type { ApplySuccess, FieldError } from '@/lib/types'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

export function useMarketApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])

  async function submit(payload: {
    name: string
    contact: string
    address: string
    businessIntro: string
    advantages: string
  }): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []

    const clientErrors: FieldError[] = []
    const name = payload.name.trim()
    if (!name) clientErrors.push({ field: 'name', message: '请填写企业/个人名称' })
    const contact = payload.contact.trim()
    if (!contact) clientErrors.push({ field: 'contact', message: '请填写联系人信息' })
    const address = payload.address.trim()
    if (!address) clientErrors.push({ field: 'address', message: '请填写地址' })
    const businessIntro = payload.businessIntro.trim()
    if (!businessIntro) clientErrors.push({ field: 'businessIntro', message: '请填写业务介绍' })
    const advantages = payload.advantages.trim()
    if (!advantages) clientErrors.push({ field: 'advantages', message: '请填写合作优势' })

    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    try {
      const res = await fetch('/api/market-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, address, businessIntro, advantages }),
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
