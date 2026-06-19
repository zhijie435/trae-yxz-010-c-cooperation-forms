import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import SkillApplyForm from '../SkillApplyForm.vue'
import { useSkillApplication } from '@/composables/useSkillApplication'

vi.mock('@/composables/useSkillApplication', () => ({
  useSkillApplication: vi.fn(),
}))

const MockFileUploader = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue', 'change', 'error'],
  setup(_, { expose }) {
    expose({ clearError: vi.fn() })
    return () => null
  },
})

const globalConfig = {
  stubs: {
    Cpu: true,
    Code2: true,
    FileText: true,
    ArrowRight: true,
    AlertCircle: true,
    Loader2: true,
    RotateCcw: true,
  },
  components: {
    FileUploader: MockFileUploader,
  },
}

function createMockComposable() {
  return {
    submitting: ref(false),
    serverErrors: ref<{ field: string; message: string }[]>([]),
    submit: vi.fn(),
  }
}

describe('SkillApplyForm', () => {
  let mock: ReturnType<typeof createMockComposable>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = createMockComposable()
    vi.mocked(useSkillApplication).mockReturnValue(mock as any)
  })

  it('应渲染表单元素', () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应显示合作方向部分', () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('合作方向')
    expect(wrapper.text()).toContain('硬件')
    expect(wrapper.text()).toContain('软件')
  })

  it('应显示个人作品集部分', () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('个人作品集')
  })

  it('初始时提交按钮应被禁用', () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('提交中显示加载状态', async () => {
    mock.submitting.value = true
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交中…')
  })

  it('点击重置按钮应重置表单', async () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    const resetButton = wrapper.find('button[type="button"]')
    await resetButton.trigger('click')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('显示服务端错误', () => {
    mock.serverErrors.value = [
      { field: 'direction', message: '请选择合作方向' },
      { field: 'attachments', message: '请上传作品集' },
    ]
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('提交未通过校验')
    expect(wrapper.text()).toContain('请选择合作方向')
    expect(wrapper.text()).toContain('请上传作品集')
  })

  it('提交成功应触发 success 事件', async () => {
    mock.submit.mockResolvedValue({
      applicationNo: 'SKILL001',
      receivedAt: '2024-01-01',
    })
    const wrapper = mount(SkillApplyForm, { global: globalConfig })

    const directionButtons = wrapper.findAll('button[type="button"]')
    await directionButtons[0].trigger('click')

    const testFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    wrapper.vm.files = [testFile]
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    expect(mock.submit).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('提交失败不应触发 success 事件', async () => {
    mock.submit.mockResolvedValue(null)
    const wrapper = mount(SkillApplyForm, { global: globalConfig })

    const directionButtons = wrapper.findAll('button[type="button"]')
    await directionButtons[0].trigger('click')

    const testFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    wrapper.vm.files = [testFile]
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('选择硬件方向', async () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    const buttons = wrapper.findAll('button[type="button"]')
    const hardwareButton = buttons.filter(btn => btn.text().includes('硬件'))[0]
    await hardwareButton.trigger('click')
    expect(hardwareButton.classes()).toContain('border-gold')
  })

  it('选择软件方向', async () => {
    const wrapper = mount(SkillApplyForm, { global: globalConfig })
    const buttons = wrapper.findAll('button[type="button"]')
    const softwareButton = buttons.filter(btn => btn.text().includes('软件'))[0]
    await softwareButton.trigger('click')
    expect(softwareButton.classes()).toContain('border-gold')
  })
})
