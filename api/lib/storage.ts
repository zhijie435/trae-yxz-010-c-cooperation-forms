import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../data')
const CAP_DATA_FILE = path.join(DATA_DIR, 'applications.json')
const SKILL_DATA_FILE = path.join(DATA_DIR, 'skill-applications.json')
const MARKET_DATA_FILE = path.join(DATA_DIR, 'market-applications.json')
const INCUBATION_DATA_FILE = path.join(DATA_DIR, 'incubation-applications.json')

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

export type SkillDirection = 'hardware' | 'software'

export interface SkillApplicationRecord {
  applicationNo: string
  direction: SkillDirection
  receivedAt: string
  attachments: AttachmentRecord[]
}

export interface MarketApplicationRecord {
  applicationNo: string
  name: string
  contact: string
  address: string
  businessIntro: string
  advantages: string
  receivedAt: string
}

export interface IncubationApplicationRecord {
  applicationNo: string
  projectIntro: string
  incubationNeeds: string
  receivedAt: string
}

function ensureDataFile(filePath: string): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf-8')
}

export function readApplications(): ApplicationRecord[] {
  ensureDataFile(CAP_DATA_FILE)
  try {
    const raw = fs.readFileSync(CAP_DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function appendApplication(record: ApplicationRecord): void {
  const all = readApplications()
  all.push(record)
  fs.writeFileSync(CAP_DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function readSkillApplications(): SkillApplicationRecord[] {
  ensureDataFile(SKILL_DATA_FILE)
  try {
    const raw = fs.readFileSync(SKILL_DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function appendSkillApplication(record: SkillApplicationRecord): void {
  const all = readSkillApplications()
  all.push(record)
  fs.writeFileSync(SKILL_DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function readMarketApplications(): MarketApplicationRecord[] {
  ensureDataFile(MARKET_DATA_FILE)
  try {
    const raw = fs.readFileSync(MARKET_DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function appendMarketApplication(record: MarketApplicationRecord): void {
  const all = readMarketApplications()
  all.push(record)
  fs.writeFileSync(MARKET_DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function readIncubationApplications(): IncubationApplicationRecord[] {
  ensureDataFile(INCUBATION_DATA_FILE)
  try {
    const raw = fs.readFileSync(INCUBATION_DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function appendIncubationApplication(record: IncubationApplicationRecord): void {
  const all = readIncubationApplications()
  all.push(record)
  fs.writeFileSync(INCUBATION_DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function generateApplicationNo(prefix: 'CAP' | 'SA' | 'MAP' | 'INC' = 'CAP'): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${prefix}-${ymd}-${rand}`
}
