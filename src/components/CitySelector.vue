<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X, MapPin } from 'lucide-vue-next'

const props = defineProps<{ modelValue: string[]; cities: string[] }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'focus'): void
}>()

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim()
  if (!q) return props.cities
  return props.cities.filter((c) => c.includes(q))
})

function isSelected(city: string): boolean {
  return props.modelValue.includes(city)
}

function toggle(city: string): void {
  if (isSelected(city)) {
    emit('update:modelValue', props.modelValue.filter((c) => c !== city))
  } else {
    emit('update:modelValue', [...props.modelValue, city])
  }
}

function remove(city: string): void {
  emit('update:modelValue', props.modelValue.filter((c) => c !== city))
}
</script>

<template>
  <div>
    <div class="relative">
      <Search class="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        v-model="query"
        type="text"
        placeholder="搜索城市…"
        class="field-input pl-6"
        @focus="emit('focus')"
      />
    </div>

    <div v-if="modelValue.length" class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="city in modelValue"
        :key="`sel-${city}`"
        class="chip border-transparent bg-ink text-paper"
      >
        {{ city }}
        <button
          type="button"
          class="ml-0.5 rounded-full p-0.5 transition-colors hover:text-gold-soft"
          :aria-label="`移除 ${city}`"
          @click="remove(city)"
        >
          <X class="h-3 w-3" />
        </button>
      </span>
    </div>

    <div class="mt-4 max-h-56 overflow-y-auto pr-1">
      <div v-if="filtered.length === 0" class="py-6 text-center text-sm text-muted">
        未找到匹配城市
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="city in filtered"
          :key="city"
          type="button"
          class="chip"
          :class="
            isSelected(city)
              ? 'border-gold bg-gold/10 text-ink'
              : 'border-line bg-paper-2/40 text-ink-soft hover:-translate-y-0.5 hover:border-gold/60 hover:bg-paper-2'
          "
          @click="toggle(city)"
        >
          <MapPin class="h-3 w-3" :class="isSelected(city) ? 'text-gold' : 'text-muted'" />
          {{ city }}
        </button>
      </div>
    </div>
  </div>
</template>
