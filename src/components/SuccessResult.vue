<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, Copy, ArrowLeft, FileCheck2 } from 'lucide-vue-next'
import type { ApplySuccess } from '@/lib/types'

const props = defineProps<{ result: ApplySuccess }>()
defineEmits<{ (e: 'reset'): void }>()

const copied = ref(false)

function fmt(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function copyNo(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.result.applicationNo)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <div class="animate-pop rounded-2xl border border-line bg-paper/80 p-8 shadow-card backdrop-blur-sm sm:p-10">
    <div class="flex flex-col items-center text-center">
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
        <CheckCircle2 class="h-8 w-8" />
      </span>
      <h2 class="mt-5 font-serif text-2xl font-semibold text-ink">申请已提交</h2>
      <p class="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        感谢您的申请，我们将在 3 个工作日内完成资质审核，结果将通过您预留的联系方式反馈。
      </p>
    </div>

    <div class="mt-8 rounded-xl border border-line bg-paper-2/40 p-5">
      <div class="flex items-center justify-between">
        <span class="field-label">
          <FileCheck2 class="h-3.5 w-3.5" />
          回执编号
        </span>
        <button
          type="button"
          class="flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-gold"
          @click="copyNo"
        >
          <Copy class="h-3 w-3" />
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <p class="mt-2 font-serif text-xl font-semibold tracking-wide text-ink">
        {{ result.applicationNo }}
      </p>
      <div class="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-[12px] text-muted">
        <span>提交时间</span>
        <span class="text-ink-soft">{{ fmt(result.receivedAt) }}</span>
      </div>
    </div>

    <button
      type="button"
      class="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      @click="$emit('reset')"
    >
      <ArrowLeft class="h-4 w-4" />
      提交新的申请
    </button>
  </div>
</template>
