import { Router, type Request, type Response } from 'express'
import {
  appendIncubationApplication,
  generateApplicationNo,
} from '../lib/storage.js'

interface FieldError {
  field: string
  message: string
}

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const errors: FieldError[] = []
  const body = req.body as {
    projectIntro?: string
    incubationNeeds?: string
  }

  const projectIntro = (body.projectIntro ?? '').trim()
  if (!projectIntro) {
    errors.push({ field: 'projectIntro', message: '请填写项目介绍' })
  } else if (projectIntro.length > 1000) {
    errors.push({ field: 'projectIntro', message: '项目介绍过长（不超过 1000 字）' })
  }

  const incubationNeeds = (body.incubationNeeds ?? '').trim()
  if (!incubationNeeds) {
    errors.push({ field: 'incubationNeeds', message: '请填写孵化需求' })
  } else if (incubationNeeds.length > 1000) {
    errors.push({ field: 'incubationNeeds', message: '孵化需求过长（不超过 1000 字）' })
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors })
    return
  }

  const record = {
    applicationNo: generateApplicationNo('INC'),
    projectIntro,
    incubationNeeds,
    receivedAt: new Date().toISOString(),
  }

  appendIncubationApplication(record)
  res.status(200).json({
    success: true,
    applicationNo: record.applicationNo,
    receivedAt: record.receivedAt,
  })
})

export default router
