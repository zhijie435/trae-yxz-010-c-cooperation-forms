import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMarketApplication } from '../useMarketApplication'

describe('useMarketApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应初始化为非提交状态', () => {
      const { submitting, serverErrors } = useMarketApplication()
      expect(submitting.value).toBe(false)
      expect(serverErrors.value).toEqual([])
    })
  })

  describe('客户端验证', () => {
    it('空名称应返回错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '',
        contact: '张三 13800138000',
        address: '北京市朝阳区',
        businessIntro: '业务介绍',
        advantages: '合作优势',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'name')).toBe(true)
    })

    it('空联系人应返回错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '',
        address: '北京市朝阳区',
        businessIntro: '业务介绍',
        advantages: '合作优势',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'contact')).toBe(true)
    })

    it('空地址应返回错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '张三 13800138000',
        address: '',
        businessIntro: '业务介绍',
        advantages: '合作优势',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'address')).toBe(true)
    })

    it('空业务介绍应返回错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '张三 13800138000',
        address: '北京市朝阳区',
        businessIntro: '',
        advantages: '合作优势',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'businessIntro')).toBe(true)
    })

    it('空合作优势应返回错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '张三 13800138000',
        address: '北京市朝阳区',
        businessIntro: '业务介绍',
        advantages: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'advantages')).toBe(true)
    })

    it('所有字段为空应返回多个错误', async () => {
      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '',
        contact: '',
        address: '',
        businessIntro: '',
        advantages: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.length).toBe(5)
    })

    it('验证失败不应调用 API', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const { submit } = useMarketApplication()
      await submit({
        name: '',
        contact: '',
        address: '',
        businessIntro: '',
        advantages: '',
      })

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('提交成功', () => {
    it('所有字段有效时提交成功', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'MARKET20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit, submitting } = useMarketApplication()
      const result = await submit({
        name: '测试科技有限公司',
        contact: '张三 13800138000',
        address: '北京市朝阳区建国路88号',
        businessIntro: '我们是一家专注于AI技术的公司...',
        advantages: '拥有核心技术团队和丰富的行业资源...',
      })

      expect(result).toEqual({
        applicationNo: 'MARKET20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(submitting.value).toBe(false)
      expect(fetch).toHaveBeenCalledWith('/api/market-apply', expect.any(Object))
    })

    it('提交数据应去除首尾空格', async () => {
      let requestBody: any = null
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        requestBody = JSON.parse(options.body)
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            applicationNo: 'M001',
            receivedAt: '2024-01-01',
          }),
        })
      })

      const { submit } = useMarketApplication()
      await submit({
        name: '  测试公司  ',
        contact: '  张三  ',
        address: '  北京  ',
        businessIntro: '  业务介绍  ',
        advantages: '  合作优势  ',
      })

      expect(requestBody.name).toBe('测试公司')
      expect(requestBody.contact).toBe('张三')
      expect(requestBody.address).toBe('北京')
      expect(requestBody.businessIntro).toBe('业务介绍')
      expect(requestBody.advantages).toBe('合作优势')
    })
  })

  describe('提交失败', () => {
    it('服务端返回错误应设置 serverErrors', async () => {
      const mockErrors = [{ field: 'name', message: '名称已存在' }]
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, errors: mockErrors }),
      })

      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '张三',
        address: '北京',
        businessIntro: '业务介绍',
        advantages: '合作优势',
      })

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual(mockErrors)
    })

    it('网络异常应返回网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { submit, serverErrors } = useMarketApplication()
      const result = await submit({
        name: '测试公司',
        contact: '张三',
        address: '北京',
        businessIntro: '业务介绍',
        advantages: '合作优势',
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
                applicationNo: 'M001',
                receivedAt: '2024-01-01',
              }),
            })
          }, 10)
        })
      })

      const { submit, submitting } = useMarketApplication()
      const submitPromise = submit({
        name: '测试公司',
        contact: '张三',
        address: '北京',
        businessIntro: '业务介绍',
        advantages: '合作优势',
      })
      submittingDuringSubmit = submitting.value
      await submitPromise

      expect(submittingDuringSubmit).toBe(true)
      expect(submitting.value).toBe(false)
    })
  })
})
