<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-vue-next'
import { validateFile, formatSize } from '@/lib/validation'

const props = defineProps<{ modelValue: File[] }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: File[]): void
  (e: 'change'): void
  (e: 'error', message: string): void
}>()

const dragging = ref(false)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(error, (v) => {
  if (v) emit('error', v)
})

function addFiles(list: FileList | null): void {
  if (!list) return
  error.value = ''
  const incoming = Array.from(list)
  const accepted: File[] = []
  const errors: string[] = []
  for (const f of incoming) {
    const err = validateFile(f)
    if (err) {
      errors.push(err)
      continue
    }
    accepted.push(f)
  }
  if (errors.length > 0) {
    error.value = errors.join('；')
  }
  if (!accepted.length) return
  const next = [...props.modelValue, ...accepted]
  if (next.length > 10) {
    error.value = '最多上传 10 个附件'
    return
  }
  emit('update:modelValue', next)
  emit('change')
}

function onDrop(e: DragEvent): void {
  dragging.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

function onInputChange(e: Event): void {
  const t = e.target as HTMLInputElement
  addFiles(t.files)
  t.value = ''
}

function openPicker(): void {
  inputRef.value?.click()
}

function remove(index: number): void {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
  emit('change')
}

function clearError(): void {
  error.value = ''
}

defineExpose({ clearError })
</script>

<template>
  <div>
    <div
      class="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-all duration-200"
      :class="
        dragging
          ? 'border-gold bg-gold/10'
          : 'border-line bg-paper-2/30 hover:border-gold/60 hover:bg-paper-2/50'
      "
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        class="hidden"
        @change="onInputChange"
      />
      <span
        class="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform group-hover:scale-105"
      >
        <UploadCloud class="h-5 w-5" />
      </span>
      <p class="text-sm text-ink">
        <span class="font-medium">拖拽文件到此处</span>
        <span class="text-muted">或点击选择</span>
      </p>
      <p class="text-[11px] text-muted">支持 PDF / JPG / PNG，单个 ≤ 10MB，最多 10 个</p>
    </div>

    <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>

    <ul v-if="modelValue.length" class="mt-4 space-y-2">
      <li
        v-for="(f, i) in modelValue"
        :key="`${f.name}-${i}`"
        class="flex items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5"
      >
        <span class="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-ink/5 text-ink-soft">
          <component :is="f.type.startsWith('image/') ? ImageIcon : FileText" class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-ink">{{ f.name }}</p>
          <p class="text-[11px] text-muted">{{ formatSize(f.size) }}</p>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted transition-colors hover:bg-ink/5 hover:text-danger"
          :aria-label="`移除 ${f.name}`"
          @click="remove(i)"
        >
          <X class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </div>
</template>
