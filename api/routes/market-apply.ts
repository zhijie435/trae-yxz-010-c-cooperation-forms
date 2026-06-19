import { Router, type Request, type Response } from 'express'
import {
  appendMarketApplication,
  generateApplicationNo,
  type ApplicationStatus,
} from '../lib/storage.js'
import { reviewConfig, notifyConfig } from '../lib/config.js'

interface FieldError {
  field: string
  message: string
}

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const errors: FieldError[] = []
  const body = req.body as {
    name?: string
    contact?: string
    address?: string
    businessIntro?: string
    advantages?: string
  }

  const name = (body.name ?? '').trim()
  if (!name) {
    errors.push({ field: 'name', message: '请填写企业/个人名称' })
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: '名称过长（不超过 100 字）' })
  }

  const contact = (body.contact ?? '').trim()
  if (!contact) {
    errors.push({ field: 'contact', message: '请填写联系人信息' })
  } else if (contact.length > 50) {
    errors.push({ field: 'contact', message: '联系人信息过长（不超过 50 字）' })
  }

  const address = (body.address ?? '').trim()
  if (!address) {
    errors.push({ field: 'address', message: '请填写地址' })
  } else if (address.length > 200) {
    errors.push({ field: 'address', message: '地址过长（不超过 200 字）' })
  }

  const businessIntro = (body.businessIntro ?? '').trim()
  if (!businessIntro) {
    errors.push({ field: 'businessIntro', message: '请填写业务介绍' })
  } else if (businessIntro.length > 500) {
    errors.push({ field: 'businessIntro', message: '业务介绍过长（不超过 500 字）' })
  }

  const advantages = (body.advantages ?? '').trim()
  if (!advantages) {
    errors.push({ field: 'advantages', message: '请填写合作优势' })
  } else if (advantages.length > 500) {
    errors.push({ field: 'advantages', message: '合作优势过长（不超过 500 字）' })
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors })
    return
  }

  const now = new Date().toISOString()
  const status: ApplicationStatus = reviewConfig.autoApprove ? 'approved' : 'pending'
  const record = {
    applicationNo: generateApplicationNo('MAP'),
    name,
    contact,
    address,
    businessIntro,
    advantages,
    receivedAt: now,
    status,
    reviewedAt: reviewConfig.autoApprove ? now : null,
  }

  appendMarketApplication(record)

  if (notifyConfig.enabled && notifyConfig.adminEmails.length > 0) {
    console.log(`[Notify] 新市场合作申请 ${record.applicationNo}，通知管理员: ${notifyConfig.adminEmails.join(', ')}`)
  }

  res.status(200).json({
    success: true,
    applicationNo: record.applicationNo,
    receivedAt: record.receivedAt,
    status,
  })
})

export default router
