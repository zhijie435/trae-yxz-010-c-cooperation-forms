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
