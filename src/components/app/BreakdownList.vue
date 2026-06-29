<script setup lang="ts">
import type { BreakdownRow } from '@/composables/useRecurringInsights'
import EntityAvatar from './EntityAvatar.vue'
import { formatCurrency } from '@/composables/useCurrency'

defineProps<{ rows: BreakdownRow[] }>()
</script>

<template>
  <div class="space-y-3.5">
    <div v-for="row in rows" :key="row.id ?? 'none'" class="space-y-1.5">
      <div class="flex items-center gap-3">
        <EntityAvatar :icon="row.icon" :color="row.color" size="sm" />
        <p class="min-w-0 flex-1 truncate text-sm font-medium">{{ row.name }}</p>
        <div class="shrink-0 text-right">
          <p class="text-sm font-semibold tabular-nums">{{ formatCurrency(row.amount) }}</p>
          <p class="text-xs text-muted-foreground tabular-nums">{{ row.percent }}%</p>
        </div>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{ width: `${row.percent}%`, backgroundColor: row.color ?? 'var(--primary)' }"
        />
      </div>
    </div>
  </div>
</template>
