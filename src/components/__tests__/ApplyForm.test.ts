import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, reactive, computed, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import ApplyForm from '../ApplyForm.vue'
import { useApplication } from '@/composables/useApplication'

vi.mock('@/composables/useApplication', () => ({
  useApplication: vi.fn(),
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
    CitySelector: true,
    Building2: true,
    Hash: true,
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
  const formData = reactive({
    companyName: '',
    creditCode: '',
    cities: [] as string[],
    files: [] as File[],
  })
  return {
    formData,
    submitting: ref(false),
    serverErrors: ref<{ field: string; message: string }[]>([]),
    companyNameError: ref(''),
    creditCodeError: ref(''),
    citiesError: ref(''),
    filesError: ref(''),
    canSubmit: ref(false),
    hasServerError: computed(() => false),
    setFieldTouched: vi.fn(),
    setCreditCode: vi.fn(),
    setUploadError: vi.fn(),
    clearUploadError: vi.fn(),
    resetForm: vi.fn(),
    submit: vi.fn(),
    fetchCities: vi.fn().mockResolvedValue([]),
  }
}

describe('ApplyForm', () => {
  let mock: ReturnType<typeof createMockComposable>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = createMockComposable()
    vi.mocked(useApplication).mockReturnValue(mock as any)
  })

  it('应渲染表单元素', () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#companyName').exists()).toBe(true)
    expect(wrapper.find('#creditCode').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应显示企业信息部分', () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('企业信息')
    expect(wrapper.text()).toContain('企业全称')
    expect(wrapper.text()).toContain('统一社会信用代码')
  })

  it('应显示覆盖城市部分', () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('覆盖城市')
  })

  it('应显示资质附件部分', () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('资质附件')
  })

  it('初始时提交按钮应被禁用', () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('canSubmit 为 true 时按钮不应禁用', () => {
    mock.canSubmit.value = true
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('显示企业名称错误', () => {
    mock.companyNameError.value = '请填写企业全称'
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('请填写企业全称')
  })

  it('显示信用代码错误', () => {
    mock.creditCodeError.value = '统一社会信用代码格式错误'
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('统一社会信用代码格式错误')
  })

  it('显示城市错误', () => {
    mock.citiesError.value = '请至少选择一个覆盖城市'
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('请至少选择一个覆盖城市')
  })

  it('显示文件错误', () => {
    mock.filesError.value = '请至少上传一个资质附件'
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('请至少上传一个资质附件')
  })

  it('显示服务端错误', () => {
    mock.serverErrors.value = [
      { field: 'companyName', message: '企业名称已存在' },
      { field: 'creditCode', message: '信用代码无效' },
    ]
    mock.hasServerError = computed(() => true)
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('提交未通过校验')
    expect(wrapper.text()).toContain('企业名称已存在')
    expect(wrapper.text()).toContain('信用代码无效')
  })

  it('提交中显示加载状态', () => {
    mock.submitting.value = true
    mock.canSubmit.value = true
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.find('button[type="submit"]').text()).toContain('提交中…')
  })

  it('点击重置按钮应调用 resetForm', async () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('button[type="button"]').trigger('click')
    expect(mock.resetForm).toHaveBeenCalled()
  })

  it('提交成功应触发 success 事件', async () => {
    mock.canSubmit.value = true
    mock.submit.mockResolvedValue({
      applicationNo: 'APP001',
      receivedAt: '2024-01-01',
    })
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('form').trigger('submit')
    expect(mock.submit).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')?.[0][0]).toEqual({
      applicationNo: 'APP001',
      receivedAt: '2024-01-01',
    })
  })

  it('提交失败不应触发 success 事件', async () => {
    mock.canSubmit.value = true
    mock.submit.mockResolvedValue(null)
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('信用代码输入应调用 setCreditCode', async () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('#creditCode').setValue('91110000')
    expect(mock.setCreditCode).toHaveBeenCalledWith('91110000')
  })

  it('企业名称失焦应标记为 touched', async () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('#companyName').trigger('blur')
    expect(mock.setFieldTouched).toHaveBeenCalledWith('companyName')
  })

  it('信用代码失焦应标记为 touched', async () => {
    const wrapper = mount(ApplyForm, { global: globalConfig })
    await wrapper.find('#creditCode').trigger('blur')
    expect(mock.setFieldTouched).toHaveBeenCalledWith('creditCode')
  })

  it('已选择城市时应显示城市数量', () => {
    mock.formData.cities = ['北京', '上海', '深圳']
    const wrapper = mount(ApplyForm, { global: globalConfig })
    expect(wrapper.text()).toContain('已选择 3 个城市')
  })
})
