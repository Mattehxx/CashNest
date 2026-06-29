<script setup lang="ts">
import { computed } from 'vue'
import type { RecurringExpense } from '@/types'
import { Badge } from '@/components/ui/badge'
import EntityAvatar from './EntityAvatar.vue'
import { formatCurrency } from '@/composables/useCurrency'
import { frequencyLabel, toMonthlyAmount } from '@/composables/useFrequency'
import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'

const props = defineProps<{ item: RecurringExpense }>()
const emit = defineEmits<{ select: [] }>()

const accounts = useAccountsStore()
const categories = useCategoriesStore()

const category = computed(() => categories.items.find((c) => c.id === props.item.categoryId) ?? null)
const account = computed(() => accounts.items.find((a) => a.id === props.item.accountId) ?? null)
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition active:scale-[0.99]"
    :class="item.isActive ? '' : 'opacity-60'"
    @click="emit('select')"
  >
    <EntityAvatar :icon="category?.icon ?? 'repeat'" :color="category?.color" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate font-semibold">{{ item.name }}</p>
        <Badge v-if="!item.isActive" variant="secondary" class="shrink-0">Non attiva</Badge>
      </div>
      <p class="truncate text-sm text-muted-foreground">
        {{ frequencyLabel(item.frequency) }}<span v-if="account"> · {{ account.name }}</span>
      </p>
    </div>
    <div class="shrink-0 text-right">
      <p class="font-semibold tabular-nums">{{ formatCurrency(item.amount) }}</p>
      <p v-if="item.frequency !== 'mensile'" class="text-xs text-muted-foreground tabular-nums">
        ≈ {{ formatCurrency(toMonthlyAmount(item.amount, item.frequency)) }}/mese
      </p>
    </div>
  </button>
</template>
