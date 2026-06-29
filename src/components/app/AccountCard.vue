<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import type { Account } from '@/types'
import { ACCOUNT_TYPE_LABELS } from '@/types'
import EntityAvatar from './EntityAvatar.vue'
import { formatCurrency } from '@/composables/useCurrency'

defineProps<{ account: Account; monthlyTotal?: number }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition active:scale-[0.99]"
    @click="emit('select')"
  >
    <EntityAvatar :icon="account.icon" :color="account.color" />
    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold">{{ account.name }}</p>
      <p class="text-sm text-muted-foreground">{{ ACCOUNT_TYPE_LABELS[account.type] }}</p>
    </div>
    <div v-if="monthlyTotal" class="shrink-0 text-right">
      <p class="text-sm font-semibold tabular-nums">{{ formatCurrency(monthlyTotal) }}</p>
      <p class="text-xs text-muted-foreground">al mese</p>
    </div>
    <ChevronRightIcon class="size-5 shrink-0 text-muted-foreground" />
  </button>
</template>
