import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

function parseIntValue(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (value === undefined || value.trim() === '') return defaultValue
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

export const serverConfig = {
  port: parseIntValue(process.env.PORT, 3001),
}

export const uploadConfig = {
  dir: path.resolve(__dirname, process.env.UPLOAD_DIR || '../../uploads'),
  maxSize: parseIntValue(process.env.UPLOAD_MAX_SIZE, 10 * 1024 * 1024),
  maxFiles: parseIntValue(process.env.UPLOAD_MAX_FILES, 10),
  allowedMime: parseArray(process.env.UPLOAD_ALLOWED_MIME, ['application/pdf', 'image/jpeg', 'image/png']),
}

export const reviewConfig = {
  autoApprove: parseBool(process.env.REVIEW_AUTO_APPROVE, false),
  requiredFields: parseArray(process.env.REVIEW_REQUIRED_FIELDS, ['companyName', 'creditCode', 'cities', 'attachments']),
  contactEmail: process.env.REVIEW_CONTACT_EMAIL || 'admin@example.com',
}

export const notifyConfig = {
  enabled: parseBool(process.env.NOTIFY_ENABLED, false),
  smtp: {
    host: process.env.NOTIFY_SMTP_HOST || '',
    port: parseIntValue(process.env.NOTIFY_SMTP_PORT, 587),
    user: process.env.NOTIFY_SMTP_USER || '',
    pass: process.env.NOTIFY_SMTP_PASS || '',
    secure: parseBool(process.env.NOTIFY_SMTP_SECURE, false),
  },
  from: {
    name: process.env.NOTIFY_FROM_NAME || '合作申请平台',
    email: process.env.NOTIFY_FROM_EMAIL || 'noreply@example.com',
  },
  adminEmails: parseArray(process.env.NOTIFY_ADMIN_EMAILS, []),
  templates: {
    applySubject: process.env.NOTIFY_TEMPLATE_APPLY_SUBJECT || '新合作申请提交通知',
    reviewSubject: process.env.NOTIFY_TEMPLATE_REVIEW_SUBJECT || '合作申请审核结果通知',
  },
}
