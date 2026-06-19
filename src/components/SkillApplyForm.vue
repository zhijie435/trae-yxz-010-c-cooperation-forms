<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import FileUploader from './FileUploader.vue'
import { useSkillApplication, type SkillDirection } from '@/composables/useSkillApplication'
import { fieldError } from '@/lib/validation'
import type { ApplySuccess } from '@/lib/types'
import {
  Cpu,
  Code2,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'success', payload: ApplySuccess): void }>()

const { submitting, serverErrors, submit } = useSkillApplication()

const direction = ref<SkillDirection | ''>('')
const files = ref<File[]>([])
const uploadError = ref('')
const uploaderRef = ref<InstanceType<typeof FileUploader> | null>(null)

defineExpose({
  files,
})

const touched = reactive({
  direction: false,
  files: false,
})

const directionError = computed(() =>
  touched.direction && !direction.value ? '请选择合作方向' : '',
)
const filesError = computed(() => {
  if (uploadError.value) return uploadError.value
  return touched.files && files.value.length === 0 ? '请至少上传一个个人作品集附件' : ''
})

const canSubmit = computed(
  () => !!direction.value && files.value.length > 0 && !submitting.value,
)

const hasServerError = computed(() => serverErrors.value.length > 0)

const directionOptions: { value: SkillDirection; label: string; icon: typeof Cpu; desc: string }[] = [
  {
    value: 'hardware',
    label: '硬件',
    icon: Cpu,
    desc: '机器人本体、传感器、嵌入式设备等硬件产品',
  },
  {
    value: 'software',
    label: '软件',
    icon: Code2,
    desc: '算法、应用、SDK、平台等软件产品',
  },
]

async function onSubmit(): Promise<void> {
  touched.direction = true
  touched.files = true
  serverErrors.value = []
  if (!canSubmit.value) return
  const res = await submit({
    direction: direction.value as SkillDirection,
    files: files.value,
  })
  if (res) emit('success', res)
}

function onUploadError(msg: string): void {
  uploadError.value = msg
  touched.files = true
}

function resetAll(): void {
  direction.value = ''
  files.value = []
  uploadError.value = ''
  uploaderRef.value?.clearError()
  touched.direction = false
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
        <h3 class="font-serif text-lg font-semibold text-ink">合作方向</h3>
        <span class="text-[11px] text-muted">01</span>
      </div>
      <p class="mb-4 text-[12px] text-muted">选择您擅长的技术领域</p>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="opt in directionOptions"
          :key="opt.value"
          type="button"
          class="group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200"
          :class="[
            direction === opt.value
              ? 'border-gold bg-gold/10 shadow-sm'
              : 'border-line bg-paper hover:border-ink/20 hover:bg-paper-2/50',
            directionError || fieldError(serverErrors, 'direction')
              ? 'border-danger/40'
              : '',
          ]"
          @click="direction = opt.value; touched.direction = true"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            :class="direction === opt.value ? 'bg-gold/20 text-ink' : 'bg-ink/5 text-ink-soft group-hover:bg-ink/10'"
          >
            <component :is="opt.icon" class="h-4.5 w-4.5" />
          </div>
          <div class="flex-1">
            <p class="font-serif text-base font-semibold text-ink">{{ opt.label }}</p>
            <p class="mt-1 text-[12px] leading-relaxed text-muted">{{ opt.desc }}</p>
          </div>
          <div
            class="ml-auto flex h-5 w-5 items-center justify-center rounded-full border transition-all"
            :class="direction === opt.value ? 'border-gold bg-gold text-paper' : 'border-line bg-paper'"
          >
            <svg
              v-if="direction === opt.value"
              viewBox="0 0 24 24"
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </button>
      </div>
      <p
        v-if="directionError || fieldError(serverErrors, 'direction')"
        class="mt-3 text-[11px] text-danger"
      >
        {{ directionError || fieldError(serverErrors, 'direction') }}
      </p>
    </section>

    <section class="mt-8">
      <div class="mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <h3 class="font-serif text-lg font-semibold text-ink">个人作品集</h3>
        <span class="text-[11px] text-muted">02</span>
      </div>
      <p class="mb-3 text-[12px] text-muted">上传过往作品案例、项目说明等材料</p>
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
        {{ submitting ? '提交中…' : '提交合作申请' }}
        <ArrowRight v-if="!submitting" class="h-4 w-4" />
      </button>
    </div>
  </form>
</template>
