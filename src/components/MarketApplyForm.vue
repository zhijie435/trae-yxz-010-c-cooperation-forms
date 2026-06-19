<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useMarketApplication } from '@/composables/useMarketApplication'
import { fieldError } from '@/lib/validation'
import type { ApplySuccess } from '@/lib/types'
import {
  Building2,
  User,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'success', payload: ApplySuccess): void }>()

const { submitting, serverErrors, submit } = useMarketApplication()

const name = ref('')
const contact = ref('')
const address = ref('')
const businessIntro = ref('')
const advantages = ref('')

const touched = reactive({
  name: false,
  contact: false,
  address: false,
  businessIntro: false,
  advantages: false,
})

const nameError = computed(() =>
  touched.name && !name.value.trim() ? '请填写企业/个人名称' : '',
)
const contactError = computed(() =>
  touched.contact && !contact.value.trim() ? '请填写联系人信息' : '',
)
const addressError = computed(() =>
  touched.address && !address.value.trim() ? '请填写地址' : '',
)
const businessIntroError = computed(() =>
  touched.businessIntro && !businessIntro.value.trim() ? '请填写业务介绍' : '',
)
const advantagesError = computed(() =>
  touched.advantages && !advantages.value.trim() ? '请填写合作优势' : '',
)

const canSubmit = computed(
  () =>
    !!name.value.trim() &&
    !!contact.value.trim() &&
    !!address.value.trim() &&
    !!businessIntro.value.trim() &&
    !!advantages.value.trim() &&
    !submitting.value,
)

const hasServerError = computed(() => serverErrors.value.length > 0)

async function onSubmit(): Promise<void> {
  touched.name = true
  touched.contact = true
  touched.address = true
  touched.businessIntro = true
  touched.advantages = true
  serverErrors.value = []
  if (!canSubmit.value) return
  const res = await submit({
    name: name.value.trim(),
    contact: contact.value.trim(),
    address: address.value.trim(),
    businessIntro: businessIntro.value.trim(),
    advantages: advantages.value.trim(),
  })
  if (res) emit('success', res)
}

function resetAll(): void {
  name.value = ''
  contact.value = ''
  address.value = ''
  businessIntro.value = ''
  advantages.value = ''
  touched.name = false
  touched.contact = false
  touched.address = false
  touched.businessIntro = false
  touched.advantages = false
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
            <Building2 class="h-3.5 w-3.5" />
            企业/个人名称
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="请填写企业全称或个人姓名"
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
            {{ nameError || fieldError(serverErrors, 'name') || '与营业执照或身份证明保持一致' }}
          </p>
        </div>

        <div>
          <label class="field-label" for="contact">
            <User class="h-3.5 w-3.5" />
            联系人
          </label>
          <input
            id="contact"
            v-model="contact"
            type="text"
            placeholder="请填写联系人姓名及电话"
            class="field-input"
            :class="
              contactError || fieldError(serverErrors, 'contact')
                ? 'border-danger focus:border-danger'
                : ''
            "
            @blur="touched.contact = true"
          />
          <p
            class="mt-1.5 text-[11px]"
            :class="
              contactError || fieldError(serverErrors, 'contact')
                ? 'text-danger'
                : 'text-muted'
            "
          >
            {{ contactError || fieldError(serverErrors, 'contact') || '便于我们与您联系' }}
          </p>
        </div>
      </div>

      <div class="mt-6">
        <label class="field-label" for="address">
          <MapPin class="h-3.5 w-3.5" />
          地址
        </label>
        <input
          id="address"
          v-model="address"
          type="text"
          placeholder="请填写详细地址"
          class="field-input"
          :class="
            addressError || fieldError(serverErrors, 'address')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.address = true"
        />
        <p
          class="mt-1.5 text-[11px]"
          :class="
            addressError || fieldError(serverErrors, 'address')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ addressError || fieldError(serverErrors, 'address') || '公司或个人办公地址' }}
        </p>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">业务介绍</h3>
        <span class="text-[11px] text-muted">02</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">请简要介绍您的业务范围和核心产品/服务</p>
      <div>
        <label class="field-label" for="businessIntro">
          <FileText class="h-3.5 w-3.5" />
          业务介绍
        </label>
        <textarea
          id="businessIntro"
          v-model="businessIntro"
          rows="4"
          placeholder="请详细描述您的业务内容、目标客户、市场定位等"
          class="field-input resize-none"
          :class="
            businessIntroError || fieldError(serverErrors, 'businessIntro')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.businessIntro = true"
        ></textarea>
        <p
          class="mt-1.5 text-[11px]"
          :class="
            businessIntroError || fieldError(serverErrors, 'businessIntro')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ businessIntroError || fieldError(serverErrors, 'businessIntro') || '不超过 500 字' }}
        </p>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">合作优势</h3>
        <span class="text-[11px] text-muted">03</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">请描述您的核心竞争力和合作价值</p>
      <div>
        <label class="field-label" for="advantages">
          <Sparkles class="h-3.5 w-3.5" />
          合作优势
        </label>
        <textarea
          id="advantages"
          v-model="advantages"
          rows="4"
          placeholder="请描述您的资源、技术、渠道等方面的优势，以及期望的合作方式"
          class="field-input resize-none"
          :class="
            advantagesError || fieldError(serverErrors, 'advantages')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.advantages = true"
        ></textarea>
        <p
          class="mt-1.5 text-[11px]"
          :class="
            advantagesError || fieldError(serverErrors, 'advantages')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ advantagesError || fieldError(serverErrors, 'advantages') || '不超过 500 字' }}
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
        {{ submitting ? '提交中…' : '提交合作申请' }}
        <ArrowRight v-if="!submitting" class="h-4 w-4" />
      </button>
    </div>
  </form>
</template>
