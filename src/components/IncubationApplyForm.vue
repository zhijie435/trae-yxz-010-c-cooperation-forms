<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useIncubationApplication } from '@/composables/useIncubationApplication'
import { fieldError } from '@/lib/validation'
import type { ApplySuccess } from '@/lib/types'
import {
  Rocket,
  Sprout,
  ArrowRight,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'success', payload: ApplySuccess): void }>()

const { submitting, serverErrors, submit } = useIncubationApplication()

const projectIntro = ref('')
const incubationNeeds = ref('')

const touched = reactive({
  projectIntro: false,
  incubationNeeds: false,
})

const projectIntroError = computed(() =>
  touched.projectIntro && !projectIntro.value.trim() ? '请填写项目介绍' : '',
)
const incubationNeedsError = computed(() =>
  touched.incubationNeeds && !incubationNeeds.value.trim() ? '请填写孵化需求' : '',
)

const canSubmit = computed(
  () =>
    !!projectIntro.value.trim() &&
    !!incubationNeeds.value.trim() &&
    !submitting.value,
)

const hasServerError = computed(() => serverErrors.value.length > 0)

async function onSubmit(): Promise<void> {
  touched.projectIntro = true
  touched.incubationNeeds = true
  serverErrors.value = []
  if (!canSubmit.value) return
  const res = await submit({
    projectIntro: projectIntro.value.trim(),
    incubationNeeds: incubationNeeds.value.trim(),
  })
  if (res) emit('success', res)
}

function resetAll(): void {
  projectIntro.value = ''
  incubationNeeds.value = ''
  touched.projectIntro = false
  touched.incubationNeeds = false
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
        <h3 class="font-serif text-lg font-semibold text-ink">项目介绍</h3>
        <span class="text-[11px] text-muted">01</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">请详细介绍您的项目背景、团队情况和发展现状</p>
      <div>
        <label class="field-label" for="projectIntro">
          <Rocket class="h-3.5 w-3.5" />
          项目介绍
        </label>
        <textarea
          id="projectIntro"
          v-model="projectIntro"
          rows="6"
          placeholder="请描述项目的核心业务、商业模式、市场定位、团队背景、发展阶段等"
          class="field-input resize-none"
          :class="
            projectIntroError || fieldError(serverErrors, 'projectIntro')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.projectIntro = true"
        ></textarea>
        <p
          class="mt-1.5 text-[11px]"
          :class="
            projectIntroError || fieldError(serverErrors, 'projectIntro')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ projectIntroError || fieldError(serverErrors, 'projectIntro') || '不超过 1000 字' }}
        </p>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">孵化需求</h3>
        <span class="text-[11px] text-muted">02</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">请描述您希望获得的孵化支持和资源</p>
      <div>
        <label class="field-label" for="incubationNeeds">
          <Sprout class="h-3.5 w-3.5" />
          孵化需求
        </label>
        <textarea
          id="incubationNeeds"
          v-model="incubationNeeds"
          rows="6"
          placeholder="请描述您在资金、场地、技术、人才、市场、政策等方面的具体需求，以及期望的孵化服务"
          class="field-input resize-none"
          :class="
            incubationNeedsError || fieldError(serverErrors, 'incubationNeeds')
              ? 'border-danger focus:border-danger'
              : ''
          "
          @blur="touched.incubationNeeds = true"
        ></textarea>
        <p
          class="mt-1.5 text-[11px]"
          :class="
            incubationNeedsError || fieldError(serverErrors, 'incubationNeeds')
              ? 'text-danger'
              : 'text-muted'
          "
        >
          {{ incubationNeedsError || fieldError(serverErrors, 'incubationNeeds') || '不超过 1000 字' }}
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
        {{ submitting ? '提交中…' : '提交孵化申请' }}
        <ArrowRight v-if="!submitting" class="h-4 w-4" />
      </button>
    </div>
  </form>
</template>
