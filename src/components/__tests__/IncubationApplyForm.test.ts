import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import IncubationApplyForm from '../IncubationApplyForm.vue'
import { useIncubationApplication } from '@/composables/useIncubationApplication'

vi.mock('@/composables/useIncubationApplication', () => ({
  useIncubationApplication: vi.fn(),
}))

const globalConfig = {
  stubs: {
    Rocket: true,
    Sprout: true,
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

describe('IncubationApplyForm', () => {
  let mock: ReturnType<typeof createMockComposable>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = createMockComposable()
    vi.mocked(useIncubationApplication).mockReturnValue(mock as any)
  })

  it('应渲染表单元素', () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#projectIntro').exists()).toBe(true)
    expect(wrapper.find('#incubationNeeds').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应显示项目介绍部分', () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('项目介绍')
  })

  it('应显示孵化需求部分', () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('孵化需求')
  })

  it('初始时提交按钮应被禁用', () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交中显示加载状态', () => {
    mock.submitting.value = true
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交中…')
  })

  it('显示服务端错误', () => {
    mock.serverErrors.value = [
      { field: 'projectIntro', message: '请填写项目介绍' },
      { field: 'incubationNeeds', message: '请填写孵化需求' },
    ]
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('提交未通过校验')
    expect(wrapper.text()).toContain('请填写项目介绍')
    expect(wrapper.text()).toContain('请填写孵化需求')
  })

  it('填写所有字段后可以提交', async () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    await wrapper.find('#projectIntro').setValue('项目介绍内容')
    await wrapper.find('#incubationNeeds').setValue('孵化需求内容')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('提交成功应触发 success 事件', async () => {
    mock.submit.mockResolvedValue({
      applicationNo: 'INCUB001',
      receivedAt: '2024-01-01',
    })
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })

    await wrapper.find('#projectIntro').setValue('项目介绍')
    await wrapper.find('#incubationNeeds').setValue('孵化需求')

    await wrapper.find('form').trigger('submit')
    expect(mock.submit).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')?.[0][0]).toEqual({
      applicationNo: 'INCUB001',
      receivedAt: '2024-01-01',
    })
  })

  it('提交失败不应触发 success 事件', async () => {
    mock.submit.mockResolvedValue(null)
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })

    await wrapper.find('#projectIntro').setValue('项目介绍')
    await wrapper.find('#incubationNeeds').setValue('孵化需求')

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('点击重置按钮应清空表单', async () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    await wrapper.find('#projectIntro').setValue('项目介绍')
    await wrapper.find('#incubationNeeds').setValue('孵化需求')
    await wrapper.find('button[type="button"]').trigger('click')
    expect((wrapper.find('#projectIntro').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('#incubationNeeds').element as HTMLTextAreaElement).value).toBe('')
  })

  it('项目介绍失焦应显示验证错误', async () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    const textarea = wrapper.find('#projectIntro')
    await textarea.trigger('blur')
    expect(wrapper.text()).toContain('请填写项目介绍')
  })

  it('孵化需求失焦应显示验证错误', async () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    const textarea = wrapper.find('#incubationNeeds')
    await textarea.trigger('blur')
    expect(wrapper.text()).toContain('请填写孵化需求')
  })

  it('仅空格的内容应视为空', async () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    await wrapper.find('#projectIntro').setValue('   ')
    await wrapper.find('#incubationNeeds').setValue('   ')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交按钮文字应为"提交孵化申请"', () => {
    const wrapper = mount(IncubationApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交孵化申请')
  })
})
