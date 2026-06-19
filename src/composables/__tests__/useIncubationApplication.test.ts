import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIncubationApplication } from '../useIncubationApplication'

describe('useIncubationApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应初始化为非提交状态', () => {
      const { submitting, serverErrors } = useIncubationApplication()
      expect(submitting.value).toBe(false)
      expect(serverErrors.value).toEqual([])
    })
  })

  describe('客户端验证', () => {
    it('空项目介绍应返回错误', async () => {
      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '',
        incubationNeeds: '孵化需求内容',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'projectIntro')).toBe(true)
    })

    it('空孵化需求应返回错误', async () => {
      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '项目介绍内容',
        incubationNeeds: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'incubationNeeds')).toBe(true)
    })

    it('所有字段为空应返回多个错误', async () => {
      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '',
        incubationNeeds: '',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.length).toBe(2)
    })

    it('验证失败不应调用 API', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const { submit } = useIncubationApplication()
      await submit({ projectIntro: '', incubationNeeds: '' })

      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('仅包含空格的内容应视为空', async () => {
      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '   ',
        incubationNeeds: '   ',
      })

      expect(result).toBeNull()
      expect(serverErrors.value.length).toBe(2)
    })
  })

  describe('提交成功', () => {
    it('所有字段有效时提交成功', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'INCUB20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit, submitting } = useIncubationApplication()
      const result = await submit({
        projectIntro: '我们的项目是一个AI驱动的智能机器人平台...',
        incubationNeeds: '需要资金支持、办公场地、技术指导...',
      })

      expect(result).toEqual({
        applicationNo: 'INCUB20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(submitting.value).toBe(false)
      expect(fetch).toHaveBeenCalledWith('/api/incubation-apply', expect.any(Object))
    })

    it('提交数据应去除首尾空格', async () => {
      let requestBody: any = null
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        requestBody = JSON.parse(options.body)
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            applicationNo: 'I001',
            receivedAt: '2024-01-01',
          }),
        })
      })

      const { submit } = useIncubationApplication()
      await submit({
        projectIntro: '  项目介绍  ',
        incubationNeeds: '  孵化需求  ',
      })

      expect(requestBody.projectIntro).toBe('项目介绍')
      expect(requestBody.incubationNeeds).toBe('孵化需求')
    })
  })

  describe('提交失败', () => {
    it('服务端返回错误应设置 serverErrors', async () => {
      const mockErrors = [{ field: 'projectIntro', message: '项目介绍不够详细' }]
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, errors: mockErrors }),
      })

      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '项目介绍',
        incubationNeeds: '孵化需求',
      })

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual(mockErrors)
    })

    it('网络异常应返回网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { submit, serverErrors } = useIncubationApplication()
      const result = await submit({
        projectIntro: '项目介绍',
        incubationNeeds: '孵化需求',
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
                applicationNo: 'I001',
                receivedAt: '2024-01-01',
              }),
            })
          }, 10)
        })
      })

      const { submit, submitting } = useIncubationApplication()
      const submitPromise = submit({
        projectIntro: '项目介绍',
        incubationNeeds: '孵化需求',
      })
      submittingDuringSubmit = submitting.value
      await submitPromise

      expect(submittingDuringSubmit).toBe(true)
      expect(submitting.value).toBe(false)
    })
  })
})
