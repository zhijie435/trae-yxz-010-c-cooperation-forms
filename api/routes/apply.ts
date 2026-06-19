import { Router, type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { appendApplication, generateApplicationNo, type ApplicationStatus } from '../lib/storage.js'
import { uploadConfig, reviewConfig, notifyConfig } from '../lib/config.js'

const UPLOAD_DIR = uploadConfig.dir
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED_MIME = uploadConfig.allowedMime
const MAX_SIZE = uploadConfig.maxSize
const MAX_FILES = uploadConfig.maxFiles

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ''
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    cb(null, `u-${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
    else cb(new Error('UNSUPPORTED_FILE_TYPE'))
  },
})

interface FieldError {
  field: string
  message: string
}

function cleanupFiles(files: { path?: string }[]): void {
  for (const f of files) {
    if (f.path) {
      try {
        fs.unlinkSync(f.path)
      } catch {
        /* ignore cleanup errors */
      }
    }
  }
}

const router = Router()

function uploadAttachments(req: Request, res: Response, next: NextFunction): void {
  upload.array('attachments', MAX_FILES)(req, res, (err: unknown) => {
    if (err) {
      const files = (req.files as Express.Multer.File[] | undefined) ?? []
      cleanupFiles(files)
      const message =
        err instanceof multer.MulterError
          ? err.code === 'LIMIT_FILE_SIZE'
            ? '单个附件不能超过 10MB'
            : err.code === 'LIMIT_FILE_COUNT'
              ? '最多上传 10 个附件'
              : err.message
          : err instanceof Error && err.message === 'UNSUPPORTED_FILE_TYPE'
            ? '仅支持 PDF / JPG / PNG 格式附件'
            : '附件上传失败'
      res.status(400).json({ success: false, errors: [{ field: 'attachments', message }] })
      return
    }
    next()
  })
}

router.post('/', uploadAttachments, (req: Request, res: Response): void => {
  const errors: FieldError[] = []
  const body = req.body as { companyName?: string; creditCode?: string; cities?: string }

  const companyName = (body.companyName ?? '').trim()
  if (!companyName) {
    errors.push({ field: 'companyName', message: '请填写企业全称' })
  } else if (companyName.length > 100) {
    errors.push({ field: 'companyName', message: '企业全称过长（不超过 100 字）' })
  }

  const creditCode = (body.creditCode ?? '').trim()
  if (!creditCode) {
    errors.push({ field: 'creditCode', message: '请填写统一社会信用代码' })
  } else if (!/^[0-9A-Z]{18}$/.test(creditCode)) {
    errors.push({ field: 'creditCode', message: '统一社会信用代码应为 18 位大写字母与数字' })
  }

  let cities: string[] = []
  try {
    const parsed = body.cities ? JSON.parse(body.cities) : []
    if (Array.isArray(parsed)) {
      cities = parsed.filter((c): c is string => typeof c === 'string')
    }
  } catch {
    cities = []
  }
  if (cities.length === 0) {
    errors.push({ field: 'cities', message: '请至少选择一个覆盖城市' })
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length === 0) {
    errors.push({ field: 'attachments', message: '请至少上传一个资质附件' })
  }

  if (errors.length > 0) {
    cleanupFiles(files)
    res.status(400).json({ success: false, errors })
    return
  }

  const now = new Date().toISOString()
  const status: ApplicationStatus = reviewConfig.autoApprove ? 'approved' : 'pending'
  const record = {
    applicationNo: generateApplicationNo('CAP'),
    companyName,
    creditCode,
    cities,
    receivedAt: now,
    status,
    reviewedAt: reviewConfig.autoApprove ? now : null,
    attachments: files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    })),
  }

  appendApplication(record)

  if (notifyConfig.enabled && notifyConfig.adminEmails.length > 0) {
    console.log(`[Notify] 新申请 ${record.applicationNo}，通知管理员: ${notifyConfig.adminEmails.join(', ')}`)
  }

  res.status(200).json({
    success: true,
    applicationNo: record.applicationNo,
    receivedAt: record.receivedAt,
    status,
  })
})

export default router
