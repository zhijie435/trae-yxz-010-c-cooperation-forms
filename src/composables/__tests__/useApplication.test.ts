import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApplication } from '../useApplication'

function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['x'.repeat(Math.min(size, 1024))], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

describe('useApplication', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应初始化空的表单数据', () => {
      const { formData } = useApplication()
      expect(formData.companyName).toBe('')
      expect(formData.creditCode).toBe('')
      expect(formData.cities).toEqual([])
      expect(formData.files).toEqual([])
    })

    it('应初始化为未 touched 状态', () => {
      const { touched } = useApplication()
      expect(touched.companyName).toBe(false)
      expect(touched.creditCode).toBe(false)
      expect(touched.cities).toBe(false)
      expect(touched.files).toBe(false)
    })

    it('应初始化为非提交状态', () => {
      const { submitting, canSubmit, hasServerError } = useApplication()
      expect(submitting.value).toBe(false)
      expect(canSubmit.value).toBe(false)
      expect(hasServerError.value).toBe(false)
    })

    it('初始时所有错误应为空', () => {
      const { companyNameError, creditCodeError, citiesError, filesError } = useApplication()
      expect(companyNameError.value).toBe('')
      expect(creditCodeError.value).toBe('')
      expect(citiesError.value).toBe('')
      expect(filesError.value).toBe('')
    })
  })

  describe('设置表单字段', () => {
    it('setCompanyName 应设置企业名称', () => {
      const { formData, setCompanyName } = useApplication()
      setCompanyName('测试科技有限公司')
      expect(formData.companyName).toBe('测试科技有限公司')
    })

    it('setCreditCode 应规范化信用代码', () => {
      const { formData, setCreditCode } = useApplication()
      setCreditCode('9111-0000_ma001abc78')
      expect(formData.creditCode).toBe('91110000MA001ABC78')
    })

    it('setCities 应设置城市列表', () => {
      const { formData, setCities } = useApplication()
      setCities(['北京', '上海'])
      expect(formData.cities).toEqual(['北京', '上海'])
    })

    it('setFiles 应设置文件列表并清空上传错误', () => {
      const { formData, setFiles, setUploadError, filesError, touched } = useApplication()
      setUploadError('测试错误')
      touched.files = true
      const files = [createMockFile('test.pdf', 1024, 'application/pdf')]
      setFiles(files)
      expect(formData.files).toEqual(files)
      expect(filesError.value).toBe('')
    })
  })

  describe('touched 状态', () => {
    it('setFieldTouched 应标记指定字段为已触摸', () => {
      const { touched, setFieldTouched } = useApplication()
      setFieldTouched('companyName')
      expect(touched.companyName).toBe(true)
      expect(touched.creditCode).toBe(false)
    })

    it('markAllTouched 应标记所有字段为已触摸', () => {
      const { touched, markAllTouched } = useApplication()
      markAllTouched()
      expect(touched.companyName).toBe(true)
      expect(touched.creditCode).toBe(true)
      expect(touched.cities).toBe(true)
      expect(touched.files).toBe(true)
    })
  })

  describe('错误验证（touched 后）', () => {
    it('触摸企业名称后显示错误', () => {
      const { companyNameError, setFieldTouched, setCompanyName } = useApplication()
      expect(companyNameError.value).toBe('')
      setFieldTouched('companyName')
      expect(companyNameError.value).toBe('请填写企业全称')
      setCompanyName('测试公司')
      expect(companyNameError.value).toBe('')
    })

    it('触摸信用代码后显示错误', () => {
      const { creditCodeError, setFieldTouched, setCreditCode } = useApplication()
      expect(creditCodeError.value).toBe('')
      setFieldTouched('creditCode')
      expect(creditCodeError.value).toBe('请填写统一社会信用代码')
      setCreditCode('91110000MA001ABC78')
      expect(creditCodeError.value).toBe('')
    })

    it('触摸城市后显示错误', () => {
      const { citiesError, setFieldTouched, setCities } = useApplication()
      expect(citiesError.value).toBe('')
      setFieldTouched('cities')
      expect(citiesError.value).toBe('请至少选择一个覆盖城市')
      setCities(['北京'])
      expect(citiesError.value).toBe('')
    })

    it('触摸文件后显示错误', () => {
      const { filesError, setFieldTouched, setFiles } = useApplication()
      expect(filesError.value).toBe('')
      setFieldTouched('files')
      expect(filesError.value).toBe('请至少上传一个资质附件')
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])
      expect(filesError.value).toBe('')
    })
  })

  describe('上传错误', () => {
    it('setUploadError 应设置上传错误并标记 files 为 touched', () => {
      const { filesError, touched, setUploadError } = useApplication()
      setUploadError('上传失败')
      expect(filesError.value).toBe('上传失败')
      expect(touched.files).toBe(true)
    })

    it('clearUploadError 应清除上传错误', () => {
      const { filesError, setUploadError, clearUploadError, setFiles } = useApplication()
      setUploadError('上传失败')
      expect(filesError.value).toBe('上传失败')
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])
      clearUploadError()
      expect(filesError.value).toBe('')
    })
  })

  describe('重置表单', () => {
    it('resetForm 应重置所有状态', () => {
      const { formData, touched, serverErrors, uploadError, resetForm, setCompanyName, setCreditCode, setCities, setFiles, markAllTouched, setUploadError } = useApplication()
      setCompanyName('测试公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])
      markAllTouched()
      setUploadError('错误')
      serverErrors.value = [{ field: 'test', message: 'test' }]

      resetForm()

      expect(formData.companyName).toBe('')
      expect(formData.creditCode).toBe('')
      expect(formData.cities).toEqual([])
      expect(formData.files).toEqual([])
      expect(touched.companyName).toBe(false)
      expect(touched.creditCode).toBe(false)
      expect(touched.cities).toBe(false)
      expect(touched.files).toBe(false)
      expect(serverErrors.value).toEqual([])
      expect(uploadError.value).toBe('')
    })
  })

  describe('canSubmit', () => {
    it('表单为空时不能提交', () => {
      const { canSubmit } = useApplication()
      expect(canSubmit.value).toBe(false)
    })

    it('表单完整时可以提交', () => {
      const { canSubmit, setCompanyName, setCreditCode, setCities, setFiles } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])
      expect(canSubmit.value).toBe(true)
    })

    it('提交中时不能提交', () => {
      const { canSubmit, submitting, setCompanyName, setCreditCode, setCities, setFiles } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])
      expect(canSubmit.value).toBe(true)
      submitting.value = true
      expect(canSubmit.value).toBe(false)
    })
  })

  describe('fetchCities', () => {
    it('成功获取城市列表', async () => {
      const mockCities = ['北京', '上海', '深圳']
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ cities: mockCities }),
      })

      const { fetchCities } = useApplication()
      const result = await fetchCities()

      expect(result).toEqual(mockCities)
      expect(fetch).toHaveBeenCalledWith('/api/cities')
    })

    it('请求失败时返回空数组', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { fetchCities } = useApplication()
      const result = await fetchCities()

      expect(result).toEqual([])
    })

    it('返回数据格式异常时返回空数组', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({}),
      })

      const { fetchCities } = useApplication()
      const result = await fetchCities()

      expect(result).toEqual([])
    })
  })

  describe('submit', () => {
    it('客户端验证失败时不应调用 API', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const { submit, serverErrors } = useApplication()
      const result = await submit()

      expect(result).toBeNull()
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(serverErrors.value.length).toBeGreaterThan(0)
    })

    it('提交成功应返回申请号和时间', async () => {
      const mockResponse = {
        success: true,
        applicationNo: 'APP202401010001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      }
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const { submit, setCompanyName, setCreditCode, setCities, setFiles, submitting } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])

      const result = await submit()

      expect(result).toEqual({
        applicationNo: 'APP202401010001',
        receivedAt: '2024-01-01T00:00:00.000Z',
      })
      expect(submitting.value).toBe(false)
    })

    it('服务端返回错误应设置 serverErrors', async () => {
      const mockErrors = [{ field: 'companyName', message: '企业名称已存在' }]
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, errors: mockErrors }),
      })

      const { submit, setCompanyName, setCreditCode, setCities, setFiles, serverErrors } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])

      const result = await submit()

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual(mockErrors)
    })

    it('网络异常应返回网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { submit, setCompanyName, setCreditCode, setCities, setFiles, serverErrors } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])

      const result = await submit()

      expect(result).toBeNull()
      expect(serverErrors.value).toEqual([{ field: 'form', message: '网络异常，请稍后重试' }])
    })

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

      const { submit, setCompanyName, setCreditCode, setCities, setFiles, submitting } = useApplication()
      setCompanyName('测试科技有限公司')
      setCreditCode('91110000MA001ABC78')
      setCities(['北京'])
      setFiles([createMockFile('test.pdf', 1024, 'application/pdf')])

      const submitPromise = submit()
      submittingDuringSubmit = submitting.value
      await submitPromise

      expect(submittingDuringSubmit).toBe(true)
      expect(submitting.value).toBe(false)
    })
  })
})
