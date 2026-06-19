import { Router, type Request, type Response } from 'express'
import {
  appendJobApplication,
  generateApplicationNo,
} from '../lib/storage.js'

interface FieldError {
  field: string
  message: string
}

const PHONE_RE = /^1[3-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const errors: FieldError[] = []
  const body = req.body as {
    name?: string
    phone?: string
    email?: string
    city?: string
    expectedSalary?: string
  }

  const name = (body.name ?? '').trim()
  if (!name) {
    errors.push({ field: 'name', message: '请填写姓名' })
  } else if (name.length > 50) {
    errors.push({ field: 'name', message: '姓名过长（不超过 50 字）' })
  }

  const phone = (body.phone ?? '').trim()
  if (!phone) {
    errors.push({ field: 'phone', message: '请填写联系电话' })
  } else if (!PHONE_RE.test(phone)) {
    errors.push({ field: 'phone', message: '请输入有效的 11 位手机号码' })
  }

  const email = (body.email ?? '').trim()
  if (!email) {
    errors.push({ field: 'email', message: '请填写邮箱' })
  } else if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: '邮箱格式不正确' })
  }

  const city = (body.city ?? '').trim()
  if (!city) {
    errors.push({ field: 'city', message: '请填写现居城市' })
  } else if (city.length > 50) {
    errors.push({ field: 'city', message: '城市名称过长（不超过 50 字）' })
  }

  const expectedSalary = (body.expectedSalary ?? '').trim()
  if (!expectedSalary) {
    errors.push({ field: 'expectedSalary', message: '请填写期望薪资' })
  } else if (expectedSalary.length > 50) {
    errors.push({ field: 'expectedSalary', message: '期望薪资过长（不超过 50 字）' })
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors })
    return
  }

  const record = {
    applicationNo: generateApplicationNo('JOB'),
    name,
    phone,
    email,
    city,
    expectedSalary,
    receivedAt: new Date().toISOString(),
  }

  appendJobApplication(record)
  res.status(200).json({
    success: true,
    applicationNo: record.applicationNo,
    receivedAt: record.receivedAt,
  })
})

export default router
