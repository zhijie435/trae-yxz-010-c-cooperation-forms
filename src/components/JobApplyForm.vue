<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useJobApplication } from '@/composables/useJobApplication'
import { fieldError } from '@/lib/validation'
import type { ApplySuccess } from '@/lib/types'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ArrowRight,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'success', payload: ApplySuccess): void }>()

const { submitting, serverErrors, submit } = useJobApplication()

const name = ref('')
const phone = ref('')
const email = ref('')
const city = ref('')
const expectedSalary = ref('')

const PHONE_RE = /^1[3-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateContact(value: string): string | null {
  const v = value.trim()
  if (!v) return '请填写联系方式'
  if (/^\d+$/.test(v)) {
    if (!PHONE_RE.test(v)) return '请输入有效的 11 位手机号码'
  } else {
    if (v.length < 6 || v.length > 50) return '微信号/联系方式长度应为 6-50 位'
  }
  return null
}

const touched = reactive({
  name: false,
  phone: false,
  email: false,
  city: false,
  expectedSalary: false,
})

const nameError = computed(() =>
  touched.name && !name.value.trim() ? '请填写姓名' : '',
)
const phoneError = computed(() => {
  if (!touched.phone) return ''
  return validateContact(phone.value) ?? ''
})
const emailError = computed(() => {
  if (!touched.email) return ''
  if (!email.value.trim()) return '请填写邮箱'
  if (!EMAIL_RE.test(email.value.trim())) return '邮箱格式不正确'
  return ''
})
const cityError = computed(() =>
  touched.city && !city.value.trim() ? '请填写现居城市' : '',
)
const expectedSalaryError = computed(() =>
  touched.expectedSalary && !expectedSalary.value.trim() ? '请填写期望薪资' : '',
)

const canSubmit = computed(
  () =>
    !!name.value.trim() &&
    validateContact(phone.value) === null &&
    EMAIL_RE.test(email.value.trim()) &&
    !!city.value.trim() &&
    !!expectedSalary.value.trim() &&
    !submitting.value,
)

const hasServerError = computed(() => serverErrors.value.length > 0)

function onPhoneInput(e: Event): void {
  const v = (e.target as HTMLInputElement).value
  phone.value = v.trim().slice(0, 50)
}

async function onSubmit(): Promise<void> {
  touched.name = true
  touched.phone = true
  touched.email = true
  touched.city = true
  touched.expectedSalary = true
  serverErrors.value = []
  if (!canSubmit.value) return
  const res = await submit({
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    city: city.value.trim(),
    expectedSalary: expectedSalary.value.trim(),
  })
  if (res) emit('success', res)
}

function resetAll(): void {
  name.value = ''
  phone.value = ''
  email.value = ''
  city.value = ''
  expectedSalary.value = ''
  touched.name = false
  touched.phone = false
  touched.email = false
  touched.city = false
  touched.expectedSalary = false
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
        <h3 class="font-serif text-lg font-semibold text-ink">基本信息</h3>
        <span class="text-[11px] text-muted">01</span>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="field-label" for="name">
            <User class="h-3.5 w-3.5" />
            姓名
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="请填写您的真实姓名"
            class="field-input"
            :class="
              nameError || fieldError(serverErrors, 'name')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @blur="touched.name = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              nameError || fieldError(serverErrors, 'name')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ nameError || fieldError(serverErrors, 'name') || '与身份证保持一致' }}
          </p>
        </div>

        <div>
          <label class="field-label" for="phone">
            <Phone class="h-3.5 w-3.5" />
            联系方式
          </label>
          <input
            id="phone"
            :value="phone"
            type="text"
            placeholder="请输入手机号或微信号"
            class="field-input"
            :class="
              phoneError || fieldError(serverErrors, 'phone')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @input="onPhoneInput"
            @blur="touched.phone = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              phoneError || fieldError(serverErrors, 'phone')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ phoneError || fieldError(serverErrors, 'phone') || '手机号或微信号，便于我们与您联系' }}
          </p>
        </div>

        <div>
          <label class="field-label" for="email">
            <Mail class="h-3.5 w-3.5" />
            邮箱
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请填写常用邮箱"
            class="field-input"
            :class="
              emailError || fieldError(serverErrors, 'email')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @blur="touched.email = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              emailError || fieldError(serverErrors, 'email')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ emailError || fieldError(serverErrors, 'email') || '用于接收面试通知' }}
          </p>
        </div>

        <div>
          <label class="field-label" for="city">
            <MapPin class="h-3.5 w-3.5" />
            现居城市
          </label>
          <input
            id="city"
            v-model="city"
            type="text"
            placeholder="如：北京、上海、深圳"
            class="field-input"
            :class="
              cityError || fieldError(serverErrors, 'city')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @blur="touched.city = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              cityError || fieldError(serverErrors, 'city')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ cityError || fieldError(serverErrors, 'city') || '您目前所在的城市' }}
          </p>
        </div>
      </div>

      <div class="mt-6">
        <label class="field-label" for="expectedSalary">
          <Wallet class="h-3.5 w-3.5" />
          期望薪资
        </label>
        <input
          id="expectedSalary"
          v-model="expectedSalary"
          type="text"
          placeholder="如：15K-20K / 月"
          class="field-input"
          :class="
            expectedSalaryError || fieldError(serverErrors, 'expectedSalary')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.expectedSalary = true"
        />
        <p
          class="mt-1.5 text-[11px]"
          :class="
            expectedSalaryError || fieldError(serverErrors, 'expectedSalary')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ expectedSalaryError || fieldError(serverErrors, 'expectedSalary') || '您的薪资期望范围' }}
        </p>
      </div>
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
        {{ submitting ? '提交中…' : '投递简历' }}
        <ArrowRight v-if="!submitting" class="h-4 w-4" />
      </button>
    </div>
  </form>
</template>
