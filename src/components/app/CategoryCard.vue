<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import type { Category } from '@/types'
import EntityAvatar from './EntityAvatar.vue'

defineProps<{ category: Category }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition active:scale-[0.99]"
    @click="emit('select')"
  >
    <EntityAvatar :icon="category.icon" :color="category.color" />
    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold">{{ category.name }}</p>
    </div>
    <ChevronRightIcon class="size-5 shrink-0 text-muted-foreground" />
  </button>
</template>
