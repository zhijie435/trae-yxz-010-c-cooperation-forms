export interface FieldError {
  field: string
  message: string
}

export interface ApplySuccess {
  applicationNo: string
  receivedAt: string
}

export type ApplyResponse =
  | { success: true; applicationNo: string; receivedAt: string }
  | { success: false; errors: FieldError[] }

export interface ApplicationFormData {
  companyName: string
  creditCode: string
  cities: string[]
  files: File[]
}

export type ApplicationFormFields = keyof ApplicationFormData | 'attachments'

export interface ApplicationFormTouched {
  companyName: boolean
  creditCode: boolean
  cities: boolean
  files: boolean
}

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
