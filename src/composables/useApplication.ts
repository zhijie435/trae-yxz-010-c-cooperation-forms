import { ref, reactive, computed } from 'vue'
import type {
  ApplySuccess,
  FieldError,
  ApplicationFormData,
  ApplicationFormTouched,
} from '@/lib/types'
import {
  validateCompanyName,
  validateCreditCode,
  validateCities,
  validateFiles,
  validateForm,
  isFormValid,
  normalizeCreditCode,
} from '@/lib/validation'

interface ApplyApiPayload {
  success: boolean
  applicationNo?: string
  receivedAt?: string
  errors?: FieldError[]
}

const createInitialFormData = (): ApplicationFormData => ({
  companyName: '',
  creditCode: '',
  cities: [],
  files: [],
})

const createInitialTouched = (): ApplicationFormTouched => ({
  companyName: false,
  creditCode: false,
  cities: false,
  files: false,
})

export function useApplication() {
  const submitting = ref(false)
  const serverErrors = ref<FieldError[]>([])
  const uploadError = ref('')

  const formData = reactive<ApplicationFormData>(createInitialFormData())
  const touched = reactive<ApplicationFormTouched>(createInitialTouched())

  const companyNameError = computed(() =>
    touched.companyName ? validateCompanyName(formData.companyName) ?? '' : '',
  )
  const creditCodeError = computed(() =>
    touched.creditCode ? validateCreditCode(formData.creditCode) ?? '' : '',
  )
  const citiesError = computed(() =>
    touched.cities ? validateCities(formData.cities) ?? '' : '',
  )
  const filesError = computed(() => {
    if (uploadError.value) return uploadError.value
    return touched.files ? validateFiles(formData.files) ?? '' : ''
  })

  const canSubmit = computed(() => isFormValid(formData) && !submitting.value)
  const hasServerError = computed(() => serverErrors.value.length > 0)

  function setFieldTouched(field: keyof ApplicationFormTouched): void {
    touched[field] = true
  }

  function markAllTouched(): void {
    touched.companyName = true
    touched.creditCode = true
    touched.cities = true
    touched.files = true
  }

  function setCompanyName(value: string): void {
    formData.companyName = value
  }

  function setCreditCode(value: string): void {
    formData.creditCode = normalizeCreditCode(value)
  }

  function setCities(value: string[]): void {
    formData.cities = value
  }

  function setFiles(value: File[]): void {
    formData.files = value
    uploadError.value = ''
  }

  function setUploadError(message: string): void {
    uploadError.value = message
    touched.files = true
  }

  function clearUploadError(): void {
    uploadError.value = ''
  }

  function resetForm(): void {
    Object.assign(formData, createInitialFormData())
    Object.assign(touched, createInitialTouched())
    serverErrors.value = []
    uploadError.value = ''
  }

  async function submit(): Promise<ApplySuccess | null> {
    submitting.value = true
    serverErrors.value = []
    uploadError.value = ''

    markAllTouched()

    const clientErrors = validateForm(formData)
    if (clientErrors.length > 0) {
      serverErrors.value = clientErrors
      submitting.value = false
      return null
    }

    const fd = new FormData()
    fd.append('companyName', formData.companyName.trim())
    fd.append('creditCode', formData.creditCode.trim())
    fd.append('cities', JSON.stringify(formData.cities))
    for (const f of formData.files) fd.append('attachments', f, f.name)

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

  return {
    formData,
    touched,
    submitting,
    serverErrors,
    uploadError,
    companyNameError,
    creditCodeError,
    citiesError,
    filesError,
    canSubmit,
    hasServerError,
    setFieldTouched,
    markAllTouched,
    setCompanyName,
    setCreditCode,
    setCities,
    setFiles,
    setUploadError,
    clearUploadError,
    resetForm,
    submit,
    fetchCities,
  }
}
