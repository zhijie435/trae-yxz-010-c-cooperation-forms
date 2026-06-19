import { describe, it, expect } from 'vitest'
import {
  validateCreditCode,
  validateCompanyName,
  validateCities,
  validateFile,
  validateFiles,
  validateForm,
  isFormValid,
  formatSize,
  fieldError,
  normalizeCreditCode,
  MAX_COMPANY_NAME_LENGTH,
  MAX_FILE_SIZE,
  MAX_FILES,
} from '../validation'
import type { ApplicationFormData, FieldError } from '../types'

describe('validateCreditCode', () => {
  it('空值应返回错误提示', () => {
    expect(validateCreditCode('')).toBe('请填写统一社会信用代码')
    expect(validateCreditCode('   ')).toBe('请填写统一社会信用代码')
  })

  it('长度不足 18 位应返回错误', () => {
    expect(validateCreditCode('91110000MA001')).toBe('统一社会信用代码应为 18 位大写字母与数字')
  })

  it('包含小写字母应返回错误', () => {
    expect(validateCreditCode('91110000ma001abc7')).toBe('统一社会信用代码应为 18 位大写字母与数字')
  })

  it('包含特殊字符应返回错误', () => {
    expect(validateCreditCode('91110000MA001ABC-7')).toBe('统一社会信用代码应为 18 位大写字母与数字')
  })

  it('18 位大写字母数字组合应通过验证', () => {
    expect(validateCreditCode('91110000MA001ABC78')).toBeNull()
    expect(validateCreditCode('913100001234567890')).toBeNull()
  })

  it('首尾空格应被修剪后验证', () => {
    expect(validateCreditCode(' 91110000MA001ABC78 ')).toBeNull()
  })
})

describe('validateCompanyName', () => {
  it('空值应返回错误提示', () => {
    expect(validateCompanyName('')).toBe('请填写企业全称')
    expect(validateCompanyName('   ')).toBe('请填写企业全称')
  })

  it('正常企业名称应通过验证', () => {
    expect(validateCompanyName('北京某某科技有限公司')).toBeNull()
  })

  it('超过最大长度应返回错误', () => {
    const longName = 'A'.repeat(MAX_COMPANY_NAME_LENGTH + 1)
    expect(validateCompanyName(longName)).toBe(`企业全称过长（不超过 ${MAX_COMPANY_NAME_LENGTH} 字）`)
  })

  it('恰好等于最大长度应通过验证', () => {
    const name = 'A'.repeat(MAX_COMPANY_NAME_LENGTH)
    expect(validateCompanyName(name)).toBeNull()
  })
})

describe('validateCities', () => {
  it('空数组应返回错误提示', () => {
    expect(validateCities([])).toBe('请至少选择一个覆盖城市')
  })

  it('非数组应返回错误', () => {
    expect(validateCities(null as unknown as string[])).toBe('请至少选择一个覆盖城市')
    expect(validateCities(undefined as unknown as string[])).toBe('请至少选择一个覆盖城市')
  })

  it('至少一个城市应通过验证', () => {
    expect(validateCities(['北京'])).toBeNull()
    expect(validateCities(['北京', '上海', '深圳'])).toBeNull()
  })
})

describe('validateFile', () => {
  function createMockFile(name: string, size: number, type: string): File {
    const file = new File(['x'.repeat(Math.min(size, 1024))], name, { type })
    Object.defineProperty(file, 'size', { value: size, writable: false })
    return file
  }

  it('文件大小超过限制应返回错误', () => {
    const file = createMockFile('test.pdf', MAX_FILE_SIZE + 1, 'application/pdf')
    expect(validateFile(file)).toBe('test.pdf 超过 10MB 限制')
  })

  it('不支持的文件格式应返回错误', () => {
    const file = createMockFile('test.gif', 1024, 'image/gif')
    expect(validateFile(file)).toBe('test.gif 格式不支持（仅 PDF / JPG / PNG）')
  })

  it('PDF 文件应通过验证', () => {
    const file = createMockFile('test.pdf', 1024, 'application/pdf')
    expect(validateFile(file)).toBeNull()
  })

  it('JPG 文件应通过验证', () => {
    const file = createMockFile('test.jpg', 1024, 'image/jpeg')
    expect(validateFile(file)).toBeNull()
  })

  it('PNG 文件应通过验证', () => {
    const file = createMockFile('test.png', 1024, 'image/png')
    expect(validateFile(file)).toBeNull()
  })

  it('JPEG 扩展名大写应通过验证', () => {
    const file = createMockFile('test.JPG', 1024, '')
    expect(validateFile(file)).toBeNull()
  })
})

describe('validateFiles', () => {
  function createMockFile(name: string, size: number, type: string): File {
    const file = new File(['x'.repeat(Math.min(size, 1024))], name, { type })
    Object.defineProperty(file, 'size', { value: size, writable: false })
    return file
  }

  it('空数组应返回错误', () => {
    expect(validateFiles([])).toBe('请至少上传一个资质附件')
  })

  it('非数组应返回错误', () => {
    expect(validateFiles(null as unknown as File[])).toBe('请至少上传一个资质附件')
  })

  it('超过最大文件数应返回错误', () => {
    const files: File[] = []
    for (let i = 0; i < MAX_FILES + 1; i++) {
      files.push(createMockFile(`file${i}.pdf`, 1024, 'application/pdf'))
    }
    expect(validateFiles(files)).toBe(`最多上传 ${MAX_FILES} 个附件`)
  })

  it('恰好等于最大文件数应通过验证', () => {
    const files: File[] = []
    for (let i = 0; i < MAX_FILES; i++) {
      files.push(createMockFile(`file${i}.pdf`, 1024, 'application/pdf'))
    }
    expect(validateFiles(files)).toBeNull()
  })

  it('其中一个文件无效应返回该文件的错误', () => {
    const files = [
      createMockFile('valid.pdf', 1024, 'application/pdf'),
      createMockFile('invalid.gif', 1024, 'image/gif'),
    ]
    expect(validateFiles(files)).toBe('invalid.gif 格式不支持（仅 PDF / JPG / PNG）')
  })

  it('所有文件有效应通过验证', () => {
    const files = [
      createMockFile('doc.pdf', 1024, 'application/pdf'),
      createMockFile('photo.jpg', 1024, 'image/jpeg'),
    ]
    expect(validateFiles(files)).toBeNull()
  })
})

describe('validateForm', () => {
  function createValidFormData(): ApplicationFormData {
    return {
      companyName: '北京某某科技有限公司',
      creditCode: '91110000MA001ABC78',
      cities: ['北京', '上海'],
      files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })],
    }
  }

  it('所有字段都有效应返回空数组', () => {
    const errors = validateForm(createValidFormData())
    expect(errors).toEqual([])
  })

  it('企业名称无效应返回对应错误', () => {
    const data = createValidFormData()
    data.companyName = ''
    const errors = validateForm(data)
    expect(errors.some(e => e.field === 'companyName')).toBe(true)
  })

  it('信用代码无效应返回对应错误', () => {
    const data = createValidFormData()
    data.creditCode = 'invalid'
    const errors = validateForm(data)
    expect(errors.some(e => e.field === 'creditCode')).toBe(true)
  })

  it('城市为空应返回对应错误', () => {
    const data = createValidFormData()
    data.cities = []
    const errors = validateForm(data)
    expect(errors.some(e => e.field === 'cities')).toBe(true)
  })

  it('文件为空应返回对应错误', () => {
    const data = createValidFormData()
    data.files = []
    const errors = validateForm(data)
    expect(errors.some(e => e.field === 'attachments')).toBe(true)
  })

  it('多个字段无效应返回多个错误', () => {
    const data: ApplicationFormData = {
      companyName: '',
      creditCode: '',
      cities: [],
      files: [],
    }
    const errors = validateForm(data)
    expect(errors.length).toBe(4)
  })
})

describe('isFormValid', () => {
  it('有效表单应返回 true', () => {
    const data: ApplicationFormData = {
      companyName: '北京某某科技有限公司',
      creditCode: '91110000MA001ABC78',
      cities: ['北京'],
      files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })],
    }
    expect(isFormValid(data)).toBe(true)
  })

  it('无效表单应返回 false', () => {
    const data: ApplicationFormData = {
      companyName: '',
      creditCode: '',
      cities: [],
      files: [],
    }
    expect(isFormValid(data)).toBe(false)
  })
})

describe('formatSize', () => {
  it('小于 1024 字节应以 B 显示', () => {
    expect(formatSize(0)).toBe('0 B')
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(1023)).toBe('1023 B')
  })

  it('1024 字节到 1MB 之间应以 KB 显示', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(1536)).toBe('1.5 KB')
    expect(formatSize(1024 * 1024 - 1)).toContain('KB')
  })

  it('1MB 以上应以 MB 显示', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
    expect(formatSize(10 * 1024 * 1024)).toBe('10.0 MB')
  })
})

describe('fieldError', () => {
  const errors: FieldError[] = [
    { field: 'companyName', message: '请填写企业全称' },
    { field: 'creditCode', message: '统一社会信用代码格式错误' },
  ]

  it('存在的字段应返回对应错误信息', () => {
    expect(fieldError(errors, 'companyName')).toBe('请填写企业全称')
  })

  it('不存在的字段应返回空字符串', () => {
    expect(fieldError(errors, 'nonexistent')).toBe('')
  })

  it('空错误数组应返回空字符串', () => {
    expect(fieldError([], 'companyName')).toBe('')
  })
})

describe('normalizeCreditCode', () => {
  it('应转换为大写', () => {
    expect(normalizeCreditCode('abc')).toBe('ABC')
  })

  it('应移除非字母数字字符', () => {
    expect(normalizeCreditCode('9111-0000_ABCD')).toBe('91110000ABCD')
  })

  it('小写字母和特殊字符混合应正确处理', () => {
    expect(normalizeCreditCode('  9111-0000_ma00  ')).toBe('91110000MA00')
  })

  it('空字符串应返回空字符串', () => {
    expect(normalizeCreditCode('')).toBe('')
  })
})
