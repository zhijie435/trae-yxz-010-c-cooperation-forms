import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import MarketApplyForm from '../MarketApplyForm.vue'
import { useMarketApplication } from '@/composables/useMarketApplication'

vi.mock('@/composables/useMarketApplication', () => ({
  useMarketApplication: vi.fn(),
}))

const globalConfig = {
  stubs: {
    Building2: true,
    User: true,
    MapPin: true,
    FileText: true,
    Sparkles: true,
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

describe('MarketApplyForm', () => {
  let mock: ReturnType<typeof createMockComposable>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = createMockComposable()
    vi.mocked(useMarketApplication).mockReturnValue(mock as any)
  })

  it('应渲染表单元素', () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#contact').exists()).toBe(true)
    expect(wrapper.find('#address').exists()).toBe(true)
    expect(wrapper.find('#businessIntro').exists()).toBe(true)
    expect(wrapper.find('#advantages').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应显示基本信息部分', () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('基本信息')
    expect(wrapper.text()).toContain('企业/个人名称')
    expect(wrapper.text()).toContain('联系人')
    expect(wrapper.text()).toContain('地址')
  })

  it('应显示业务介绍部分', () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('业务介绍')
  })

  it('应显示合作优势部分', () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('合作优势')
  })

  it('初始时提交按钮应被禁用', () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交中显示加载状态', () => {
    mock.submitting.value = true
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交中…')
  })

  it('显示服务端错误', () => {
    mock.serverErrors.value = [
      { field: 'name', message: '名称不能为空' },
      { field: 'contact', message: '联系人不能为空' },
    ]
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('提交未通过校验')
    expect(wrapper.text()).toContain('名称不能为空')
    expect(wrapper.text()).toContain('联系人不能为空')
  })

  it('填写所有字段后可以提交', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('测试公司')
    await wrapper.find('#contact').setValue('张三 13800138000')
    await wrapper.find('#address').setValue('北京市朝阳区')
    await wrapper.find('#businessIntro').setValue('业务介绍内容')
    await wrapper.find('#advantages').setValue('合作优势内容')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('提交成功应触发 success 事件', async () => {
    mock.submit.mockResolvedValue({
      applicationNo: 'MARKET001',
      receivedAt: '2024-01-01',
    })
    const wrapper = mount(MarketApplyForm, { global: globalConfig })

    await wrapper.find('#name').setValue('测试公司')
    await wrapper.find('#contact').setValue('张三')
    await wrapper.find('#address').setValue('北京')
    await wrapper.find('#businessIntro').setValue('业务介绍')
    await wrapper.find('#advantages').setValue('合作优势')

    await wrapper.find('form').trigger('submit')
    expect(mock.submit).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')?.[0][0]).toEqual({
      applicationNo: 'MARKET001',
      receivedAt: '2024-01-01',
    })
  })

  it('提交失败不应触发 success 事件', async () => {
    mock.submit.mockResolvedValue(null)
    const wrapper = mount(MarketApplyForm, { global: globalConfig })

    await wrapper.find('#name').setValue('测试公司')
    await wrapper.find('#contact').setValue('张三')
    await wrapper.find('#address').setValue('北京')
    await wrapper.find('#businessIntro').setValue('业务介绍')
    await wrapper.find('#advantages').setValue('合作优势')

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('点击重置按钮应清空表单', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    await wrapper.find('#name').setValue('测试公司')
    await wrapper.find('#contact').setValue('张三')
    await wrapper.find('button[type="button"]').trigger('click')
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#contact').element as HTMLInputElement).value).toBe('')
  })

  it('名称输入失焦应显示验证错误', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    const input = wrapper.find('#name')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('请填写企业/个人名称')
  })

  it('联系人输入失焦应显示验证错误', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    const input = wrapper.find('#contact')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('请填写联系人信息')
  })

  it('地址输入失焦应显示验证错误', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    const input = wrapper.find('#address')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('请填写地址')
  })

  it('业务介绍失焦应显示验证错误', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    const textarea = wrapper.find('#businessIntro')
    await textarea.trigger('blur')
    expect(wrapper.text()).toContain('请填写业务介绍')
  })

  it('合作优势失焦应显示验证错误', async () => {
    const wrapper = mount(MarketApplyForm, { global: globalConfig })
    const textarea = wrapper.find('#advantages')
    await textarea.trigger('blur')
    expect(wrapper.text()).toContain('请填写合作优势')
  })
})
