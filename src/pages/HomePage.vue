<script setup lang="ts">
import { ref } from 'vue'
import ApplyForm from '@/components/ApplyForm.vue'
import SuccessResult from '@/components/SuccessResult.vue'
import type { ApplySuccess } from '@/lib/types'

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
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-paper">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V10l5-3 5 3v11" />
              <path d="M15 21v-5h4v5" />
              <path d="M9 13h2" />
            </svg>
          </span>
          <div class="leading-tight">
            <p class="font-serif text-[15px] font-semibold text-ink">城市合伙人计划</p>
            <p class="text-[10px] uppercase tracking-[0.22em] text-muted">City Partner Program</p>
          </div>
        </div>
        <span
          class="hidden rounded-full border border-line bg-paper-2/50 px-3 py-1 text-[11px] tracking-wide text-ink-soft sm:inline"
        >
          提交后生成专属回执编号
        </span>
      </header>

      <section class="mt-12 animate-rise" style="animation-delay: 80ms">
        <p class="mb-3 text-[11px] uppercase tracking-[0.3em] text-gold">Partnership Application</p>
        <h1 class="font-serif text-4xl font-semibold leading-[1.15] text-ink sm:text-5xl">
          城市合伙人申请
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          填写企业资质信息并上传相关材料，与我们共建城市服务网络。提交后将生成专属回执编号，便于后续跟进。
        </p>
        <div class="mt-6 h-px w-full bg-gradient-to-r from-gold/70 via-line to-transparent"></div>
      </section>

      <main class="mt-8 flex-1">
        <SuccessResult v-if="result" :result="result" @reset="onReset" />
        <ApplyForm v-else @success="onSuccess" />
      </main>

      <footer
        class="mt-12 flex items-center justify-between border-t border-line pt-5 text-[11px] text-muted animate-rise"
        style="animation-delay: 160ms"
      >
        <span>© 2026 城市合伙人计划</span>
        <span>提交即代表同意信息用于合作审核</span>
      </footer>
    </div>
  </div>
</template>
