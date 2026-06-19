import { Router, type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {
  appendSkillApplication,
  generateApplicationNo,
  type SkillDirection,
  type ApplicationStatus,
} from '../lib/storage.js'
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
    cb(null, `s-${unique}${ext}`)
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

const VALID_DIRECTIONS: SkillDirection[] = ['hardware', 'software']

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
  const body = req.body as { direction?: string }

  const direction = (body.direction ?? '').trim() as SkillDirection
  if (!direction) {
    errors.push({ field: 'direction', message: '请选择合作方向' })
  } else if (!VALID_DIRECTIONS.includes(direction)) {
    errors.push({ field: 'direction', message: '合作方向无效，请选择硬件或软件' })
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length === 0) {
    errors.push({ field: 'attachments', message: '请至少上传一个个人作品集附件' })
  }

  if (errors.length > 0) {
    cleanupFiles(files)
    res.status(400).json({ success: false, errors })
    return
  }

  const now = new Date().toISOString()
  const status: ApplicationStatus = reviewConfig.autoApprove ? 'approved' : 'pending'
  const record = {
    applicationNo: generateApplicationNo('SA'),
    direction,
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

  appendSkillApplication(record)

  if (notifyConfig.enabled && notifyConfig.adminEmails.length > 0) {
    console.log(`[Notify] 新技能合作申请 ${record.applicationNo}，通知管理员: ${notifyConfig.adminEmails.join(', ')}`)
  }

  res.status(200).json({
    success: true,
    applicationNo: record.applicationNo,
    receivedAt: record.receivedAt,
    status,
  })
})

export default router
