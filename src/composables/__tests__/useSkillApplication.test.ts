import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSkillApplication } from '../useSkillApplication'

function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['x'.repeat(Math.min(size, 1024))], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

describe('useSkillApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应初始化为非提交状态', () => {
      const { submitting, serverErrors } = useSkillApplication()
      expect(submitting.value).toBe(false)
      expect(serverErrors.value).toEqual([])
    })
  })

  describe('客户端验证', () => {
    it('空方向应返回错误', async () => {
      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: '' as any,
        files: [createMockFile('test.pdf', 1024, 'application/pdf')],
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'direction')).toBe(true)
    })

    it('无效方向应返回错误', async () => {
      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: 'invalid' as any,
        files: [createMockFile('test.pdf', 1024, 'application/pdf')],
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'direction')).toBe(true)
    })

    it('空文件列表应返回错误', async () => {
      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: 'hardware',
        files: [],
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'attachments')).toBe(true)
    })

    it('无效文件应返回错误', async () => {
      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: 'hardware',
        files: [createMockFile('test.gif', 1024, 'image/gif')],
      })

      expect(result).toBeNull()
      expect(serverErrors.value.some(e => e.field === 'attachments')).toBe(true)
    })

    it('验证失败不应调用 API', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const { submit } = useSkillApplication()
      await submit({ direction: '' as any, files: [] })

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('提交成功', () => {
    it('硬件方向提交成功', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'SKILL20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit, submitting } = useSkillApplication()
      const result = await submit({
        direction: 'hardware',
        files: [createMockFile('portfolio.pdf', 1024, 'application/pdf')],
      })

      expect(result).toEqual({
        applicationNo: 'SKILL20240101001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(submitting.value).toBe(false)
    })

    it('软件方向提交成功', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'SKILL20240101002',
        receivedAt: '2024-01-02T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit } = useSkillApplication()
      const result = await submit({
        direction: 'software',
        files: [createMockFile('portfolio.pdf', 1024, 'application/pdf')],
      })

      expect(result).toEqual({
        applicationNo: 'SKILL20240101002',
        receivedAt: '2024-01-02T00:00:00.000Z',
      })
    })
  })

  describe('提交失败', () => {
    it('服务端返回错误应设置 serverErrors', async () => {
      const mockErrors = [{ field: 'direction', message: '方向不支持' }]
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, errors: mockErrors }),
      })

      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: 'hardware',
        files: [createMockFile('test.pdf', 1024, 'application/pdf')],
      })

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual(mockErrors)
    })

    it('网络异常应返回网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { submit, serverErrors } = useSkillApplication()
      const result = await submit({
        direction: 'hardware',
        files: [createMockFile('test.pdf', 1024, 'application/pdf')],
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
                applicationNo: 'APP001',
                receivedAt: '2024-01-01',
              }),
            })
          }, 10)
        })
      })

      const { submit, submitting } = useSkillApplication()
      const submitPromise = submit({
        direction: 'hardware',
        files: [createMockFile('test.pdf', 1024, 'application/pdf')],
      })
      submittingDuringSubmit = submitting.value
      await submitPromise

      expect(submittingDuringSubmit).toBe(true)
      expect(submitting.value).toBe(false)
    })
  })
})
