<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import CitySelector from './CitySelector.vue'
import FileUploader from './FileUploader.vue'
import { useApplication } from '@/composables/useApplication'
import { validateCreditCode, fieldError } from '@/lib/validation'
import type { ApplySuccess } from '@/lib/types'
import {
  Building2,
  Hash,
  Paperclip,
  ArrowRight,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'success', payload: ApplySuccess): void }>()

const { submitting, serverErrors, submit, fetchCities } = useApplication()

const companyName = ref('')
const creditCode = ref('')
const cities = ref<string[]>([])
const files = ref<File[]>([])
const cityOptions = ref<string[]>([])
const uploadError = ref('')
const uploaderRef = ref<InstanceType<typeof FileUploader> | null>(null)

const touched = reactive({
  companyName: false,
  creditCode: false,
  cities: false,
  files: false,
})

const companyNameError = computed(() =>
  touched.companyName && !companyName.value.trim() ? '请填写企业全称' : '',
)
const creditCodeError = computed(() =>
  touched.creditCode ? validateCreditCode(creditCode.value) ?? '' : '',
)
const citiesError = computed(() =>
  touched.cities && cities.value.length === 0 ? '请至少选择一个覆盖城市' : '',
)
const filesError = computed(() => {
  if (uploadError.value) return uploadError.value
  return touched.files && files.value.length === 0 ? '请至少上传一个资质附件' : ''
})

const canSubmit = computed(
  () =>
    !!companyName.value.trim() &&
    validateCreditCode(creditCode.value) === null &&
    cities.value.length > 0 &&
    files.value.length > 0 &&
    !submitting.value,
)

const hasServerError = computed(() => serverErrors.value.length > 0)

onMounted(async () => {
  cityOptions.value = await fetchCities()
})

function onCreditInput(e: Event): void {
  const v = (e.target as HTMLInputElement).value
  creditCode.value = v.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

function onUploadError(msg: string): void {
  uploadError.value = msg
  touched.files = true
}

async function onSubmit(): Promise<void> {
  touched.companyName = true
  touched.creditCode = true
  touched.cities = true
  touched.files = true
  serverErrors.value = []
  if (!canSubmit.value) return
  const res = await submit({
    companyName: companyName.value.trim(),
    creditCode: creditCode.value.trim(),
    cities: cities.value,
    files: files.value,
  })
  if (res) emit('success', res)
}

function resetAll(): void {
  companyName.value = ''
  creditCode.value = ''
  cities.value = []
  files.value = []
  uploadError.value = ''
  uploaderRef.value?.clearError()
  touched.companyName = false
  touched.creditCode = false
  touched.cities = false
  touched.files = false
  serverErrors.value = []
}
</script>

<template>
  <form
    class="animate-rise rounded-2xl border border-line bg-paper/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div
      v-if="hasServerError"
      class="mb-6 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger"
    >
      <AlertCircle class="mt-0.5 h-4 w-4 flex-none" />
      <div>
        <p class="font-medium">提交未通过校验</p>
        <ul class="mt-1 list-inside list-disc space-y-0.5">
          <li v-for="(e, i) in serverErrors" :key="i">{{ e.message }}</li>
        </ul>
      </div>
    </div>

    <section>
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">企业信息</h3>
        <span class="text-[11px] text-muted">01</span>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="field-label" for="companyName">
            <Building2 class="h-3.5 w-3.5" />
            企业全称
          </label>
          <input
            id="companyName"
            v-model="companyName"
            type="text"
            placeholder="请填写营业执照上的企业全称"
            class="field-input"
            :class="
              companyNameError || fieldError(serverErrors, 'companyName')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @blur="touched.companyName = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              companyNameError || fieldError(serverErrors, 'companyName')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ companyNameError || fieldError(serverErrors, 'companyName') || '与营业执照保持一致' }}
          </p>
        </div>

        <div>
          <label class="field-label" for="creditCode">
            <Hash class="h-3.5 w-3.5" />
            统一社会信用代码
          </label>
          <input
            id="creditCode"
            :value="creditCode"
            type="text"
            maxlength="18"
            placeholder="18 位大写字母与数字"
            class="field-input tracking-[0.12em]"
            :class="
              creditCodeError || fieldError(serverErrors, 'creditCode')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @input="onCreditInput"
            @blur="touched.creditCode = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              creditCodeError || fieldError(serverErrors, 'creditCode')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ creditCodeError || fieldError(serverErrors, 'creditCode') || '用于企业资质核验' }}
          </p>
        </div>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">覆盖城市</h3>
        <span class="text-[11px] text-muted">02</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">选择您的企业可提供服务的城市（可多选）</p>
      <CitySelector v-model="cities" :cities="cityOptions" @focus="touched.cities = true" />
      <p
        v-if="citiesError || fieldError(serverErrors, 'cities')"
        class="mt-2 text-[11px] text-danger"
      >
        {{ citiesError || fieldError(serverErrors, 'cities') }}
      </p>
      <p v-else-if="cities.length" class="mt-2 text-[11px] text-muted">
        已选择 {{ cities.length }} 个城市
      </p>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">资质附件</h3>
        <span class="text-[11px] text-muted">03</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">上传营业执照、相关资质证书等材料</p>
      <FileUploader ref="uploaderRef" v-model="files" @change="touched.files = true; uploadError = ''" @error="onUploadError" />
      <p
        v-if="filesError || fieldError(serverErrors, 'attachments')"
        class="mt-2 text-[11px] text-danger"
      >
        {{ filesError || fieldError(serverErrors, 'attachments') }}
      </p>
    </section>

    <div class="mt-9 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        @click="resetAll"
      >
        <RotateCcw class="h-3.5 w-3.5" />
        重置表单
      </button>
      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-ink-soft hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        :disabled="!canSubmit"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
        {{ submitting ? '提交中…' : '提交申请' }}
        <ArrowRight v-if="!submitting" class="h-4 w-4" />
      </button>
    </div>
  </form>
</template>
