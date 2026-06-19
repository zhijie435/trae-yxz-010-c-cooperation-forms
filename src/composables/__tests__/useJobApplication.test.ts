import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useJobApplication } from '../useJobApplication'

describe('useJobApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应初始化为非提交状态', () => {
      const { submitting, serverErrors } = useJobApplication()
      expect(submitting.value).toBe(false)
      expect(serverErrors.value).toEqual([])
    })
  })

  describe('客户端验证 - 姓名', () => {
    it('空姓名应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'name')).toBe(true)
    })

    it('仅空格姓名应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '   ',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'name')).toBe(true)
    })
  })

  describe('客户端验证 - 手机号', () => {
    it('空手机号应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'phone')).toBe(true)
    })

    it('格式错误的手机号应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '1234567890',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'phone')).toBe(true)
    })

    it('非 1 开头的手机号应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '23800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'phone')).toBe(true)
    })

    it('第二位为 2 的手机号应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '12800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'phone')).toBe(true)
    })

    it('正确的手机号应通过验证', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          applicationNo: 'JOB001',
          receivedAt: '2024-01-01',
        }),
      })

      const { submit } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).not.toBeNull()
    })

    it('159 开头的手机号应通过验证', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          applicationNo: 'JOB002',
          receivedAt: '2024-01-01',
        }),
      })

      const { submit } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '15900138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).not.toBeNull()
    })
  })

  describe('客户端验证 - 邮箱', () => {
    it('空邮箱应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: '',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'email')).toBe(true)
    })

    it('格式错误的邮箱应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'invalid-email',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'email')).toBe(true)
    })

    it('缺少 @ 的邮箱应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'testexample.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'email')).toBe(true)
    })

    it('缺少域名的邮箱应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'email')).toBe(true)
    })

    it('正确的邮箱应通过验证', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          applicationNo: 'JOB003',
          receivedAt: '2024-01-01',
        }),
      })

      const { submit } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).not.toBeNull()
    })
  })

  describe('客户端验证 - 城市和薪资', () => {
    it('空城市应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'city')).toBe(true)
    })

    it('空期望薪资应返回错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'expectedSalary')).toBe(true)
    })
  })

  describe('客户端验证 - 全部无效', () => {
    it('所有字段为空应返回多个错误', async () => {
      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '',
        phone: '',
        email: '',
        city: '',
        expectedSalary: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.length).toBe(5)
    })

    it('验证失败不应调用 API', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const { submit } = useJobApplication()
      await submit({
        name: '',
        phone: '',
        email: '',
        city: '',
        expectedSalary: '',
      })

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('提交成功', () => {
    it('所有字段有效时提交成功', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'JOB20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit, submitting } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        city: '北京',
        expectedSalary: '20K-30K',
      })

      expect(result).toEqual({
        applicationNo: 'JOB20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(submitting.value).toBe(false)
      expect(fetch).toHaveBeenCalledWith('/api/job-apply', expect.any(Object))
    })

    it('提交数据应去除首尾空格', async () => {
      let requestBody: any = null
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        requestBody = JSON.parse(options.body)
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            applicationNo: 'J001',
            receivedAt: '2024-01-01',
          }),
        })
      })

      const { submit } = useJobApplication()
      await submit({
        name: '  张三  ',
        phone: ' 13800138000 ',
        email: ' test@example.com ',
        city: ' 北京 ',
        expectedSalary: ' 15K-20K ',
      })

      expect(requestBody.name).toBe('张三')
      expect(requestBody.phone).toBe('13800138000')
      expect(requestBody.email).toBe('test@example.com')
      expect(requestBody.city).toBe('北京')
      expect(requestBody.expectedSalary).toBe('15K-20K')
    })
  })

  describe('提交失败', () => {
    it('服务端返回错误应设置 serverErrors', async () => {
      const mockErrors = [{ field: 'phone', message: '手机号已注册' }]
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, errors: mockErrors }),
      })

      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual(mockErrors)
    })

    it('网络异常应返回网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { submit, serverErrors } = useJobApplication()
      const result = await submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual([{ field: 'form', message: '网络异常，请稍后重试' }])
    })
  })

  describe('提交状态', () => {
    it('提交过程中 submitting 应为 true', async () => {
      let submittingDuringSubmit = false
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve({
                success: true,
                applicationNo: 'J001',
                receivedAt: '2024-01-01',
              }),
            })
          }, 10)
        })
      })

      const { submit, submitting } = useJobApplication()
      const submitPromise = submit({
        name: '张三',
        phone: '13800138000',
        email: 'test@example.com',
        city: '北京',
        expectedSalary: '15K-20K',
      })
      submittingDuringSubmit = submitting.value
      await submitPromise

      expect(submittingDuringSubmit).toBe(true)
      expect(submitting.value).toBe(false)
    })
  })
})
