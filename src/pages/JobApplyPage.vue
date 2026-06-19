<script setup lang="ts">
import { ref } from 'vue'
import JobApplyForm from '@/components/JobApplyForm.vue'
import SuccessResult from '@/components/SuccessResult.vue'
import type { ApplySuccess } from '@/lib/types'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const result = ref<ApplySuccess | null>(null)

function onSuccess(payload: ApplySuccess): void {
  result.value = payload
}

function onReset(): void {
  result.value = null
}
</script>

<template>
  <div class="grain relative min-h-screen w-full overflow-x-hidden">
    <div
      class="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-16"
    >
      <header class="flex items-center justify-between animate-rise">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-paper/50 text-ink transition-all hover:border-gold/50 hover:bg-gold/10 hover:text-ink"
            @click="router.push('/')"
            aria-label="返回首页"
          >
            <ArrowLeft class="h-4 w-4" />
          </button>
          <div class="leading-tight">
            <p class="font-serif text-[15px] font-semibold text-ink">我要应聘</p>
            <p class="text-[10px] uppercase tracking-[0.22em] text-muted">Job Application</p>
          </div>
        </div>
        <span
          class="hidden rounded-full border border-line bg-paper-2/50 px-3 py-1 text-[11px] tracking-wide text-ink-soft sm:inline"
        >
          提交后生成专属回执编号
        </span>
      </header>

      <section class="mt-12 animate-rise" style="animation-delay: 80ms">
        <p class="mb-3 text-[11px] uppercase tracking-[0.3em] text-gold">Resume Submission</p>
        <h1 class="font-serif text-4xl font-semibold leading-[1.15] text-ink sm:text-5xl">
          我要应聘
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          填写您的个人信息与求职意向，投递简历后我们将尽快与您联系。提交后将生成专属回执编号，便于后续跟进。
        </p>
        <div class="mt-6 h-px w-full bg-gradient-to-r from-gold/70 via-line to-transparent"></div>
      </section>

      <main class="mt-8 flex-1">
        <SuccessResult v-if="result" :result="result" @reset="onReset" />
        <JobApplyForm v-else @success="onSuccess" />
      </main>

      <footer
        class="mt-12 flex items-center justify-between border-t border-line pt-5 text-[11px] text-muted animate-rise"
        style="animation-delay: 160ms"
      >
        <span>© 2026 人才招聘计划</span>
        <span>提交即代表同意信息用于招聘审核</span>
      </footer>
    </div>
  </div>
</template>
