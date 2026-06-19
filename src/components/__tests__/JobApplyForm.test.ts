import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import JobApplyForm from '../JobApplyForm.vue'
import { useJobApplication } from '@/composables/useJobApplication'

vi.mock('@/composables/useJobApplication', () => ({
  useJobApplication: vi.fn(),
}))

const globalConfig = {
  stubs: {
    User: true,
    Phone: true,
    Mail: true,
    MapPin: true,
    Wallet: true,
    ArrowRight: true,
    AlertCircle: true,
    Loader2: true,
    RotateCcw: true,
  },
}

function createMockComposable() {
  return {
    submitting: ref(false),
    serverErrors: ref<{ field: string; message: string }[]>([]),
    submit: vi.fn(),
  }
}

describe('JobApplyForm', () => {
  let mock: ReturnType<typeof createMockComposable>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = createMockComposable()
    vi.mocked(useJobApplication).mockReturnValue(mock as any)
  })

  it('应渲染表单元素', () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#phone').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#city').exists()).toBe(true)
    expect(wrapper.find('#expectedSalary').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应显示基本信息部分', () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('基本信息')
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('联系方式')
    expect(wrapper.text()).toContain('邮箱')
    expect(wrapper.text()).toContain('现居城市')
    expect(wrapper.text()).toContain('期望薪资')
  })

  it('初始时提交按钮应被禁用', () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交中显示加载状态', () => {
    mock.submitting.value = true
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交中…')
  })

  it('显示服务端错误', () => {
    mock.serverErrors.value = [
      { field: 'name', message: '请填写姓名' },
      { field: 'phone', message: '手机号格式不正确' },
    ]
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('提交未通过校验')
    expect(wrapper.text()).toContain('请填写姓名')
    expect(wrapper.text()).toContain('手机号格式不正确')
  })

  it('填写所有有效字段后可以提交', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('13800138000')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('无效手机号不能提交', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('123456')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('无效邮箱不能提交', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('13800138000')
    await wrapper.find('#email').setValue('invalid-email')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交成功应触发 success 事件', async () => {
    mock.submit.mockResolvedValue({
      applicationNo: 'JOB001',
      receivedAt: '2024-01-01',
    })
    const wrapper = mount(JobApplyForm, { global: globalConfig })

    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('13800138000')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')

    await wrapper.find('form').trigger('submit')
    expect(mock.submit).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')?.[0][0]).toEqual({
      applicationNo: 'JOB001',
      receivedAt: '2024-01-01',
    })
  })

  it('提交失败不应触发 success 事件', async () => {
    mock.submit.mockResolvedValue(null)
    const wrapper = mount(JobApplyForm, { global: globalConfig })

    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('13800138000')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('点击重置按钮应清空表单', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('13800138000')
    await wrapper.find('button[type="button"]').trigger('click')
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#phone').element as HTMLInputElement).value).toBe('')
  })

  it('姓名失焦应显示验证错误', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').trigger('blur')
    expect(wrapper.text()).toContain('请填写姓名')
  })

  it('手机号失焦应显示验证错误', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#phone').trigger('blur')
    expect(wrapper.text()).toContain('请填写联系方式')
  })

  it('邮箱失焦应显示验证错误', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#email').trigger('blur')
    expect(wrapper.text()).toContain('请填写邮箱')
  })

  it('城市失焦应显示验证错误', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#city').trigger('blur')
    expect(wrapper.text()).toContain('请填写现居城市')
  })

  it('期望薪资失焦应显示验证错误', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#expectedSalary').trigger('blur')
    expect(wrapper.text()).toContain('请填写期望薪资')
  })

  it('微信号应完整保留不被过滤', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    const input = wrapper.find('#phone')
    await input.setValue('wxid_zhangsan123')
    expect((input.element as HTMLInputElement).value).toBe('wxid_zhangsan123')
  })

  it('微信号可以提交', async () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('张三')
    await wrapper.find('#phone').setValue('wxid_zhangsan123')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#city').setValue('北京')
    await wrapper.find('#expectedSalary').setValue('15K-20K')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('提交按钮文字应为"投递简历"', () => {
    const wrapper = mount(JobApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('投递简历')
  })
})
