import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../data')
const DATA_FILE = path.join(DATA_DIR, 'applications.json')

export interface AttachmentRecord {
  filename: string
  originalName: string
  size: number
  mimetype: string
}

export interface ApplicationRecord {
  applicationNo: string
  companyName: string
  creditCode: string
  cities: string[]
  receivedAt: string
  attachments: AttachmentRecord[]
}

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
}

export function readApplications(): ApplicationRecord[] {
  ensureDataFile()
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function appendApplication(record: ApplicationRecord): void {
  const all = readApplications()
  all.push(record)
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function generateApplicationNo(): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `CAP-${ymd}-${rand}`
}
