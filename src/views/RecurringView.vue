<script setup lang="ts">
import { computed, ref } from 'vue'
import { PlusIcon, RepeatIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import RecurringCard from '@/components/app/RecurringCard.vue'
import RecurringFormDialog from '@/components/app/RecurringFormDialog.vue'
import ListTransition from '@/components/app/ListTransition.vue'
import type { RecurringExpense } from '@/types'
import { useRecurringStore } from '@/stores/recurring.store'

const recurring = useRecurringStore()
const dialogOpen = ref(false)
const selected = ref<RecurringExpense | null>(null)

// Attive prima, poi per nome.
const sortedItems = computed(() =>
  [...recurring.items].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.name.localeCompare(b.name, 'it')
  }),
)

function openCreate(): void {
  selected.value = null
  dialogOpen.value = true
}
function openEdit(item: RecurringExpense): void {
  selected.value = item
  dialogOpen.value = true
}
</script>

<template>
  <div>
    <PageHeader title="Ricorrenti" subtitle="Spese che si ripetono">
      <template #action>
        <Button
          size="icon"
          class="size-10 rounded-full"
          aria-label="Aggiungi spesa ricorrente"
          @click="openCreate"
        >
          <PlusIcon class="size-5" />
        </Button>
      </template>
    </PageHeader>

    <div v-if="recurring.loading && !recurring.loaded" class="space-y-2.5">
      <Skeleton v-for="i in 5" :key="i" class="h-[68px] w-full rounded-2xl" />
    </div>

    <ListTransition v-else-if="sortedItems.length">
      <RecurringCard
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        @select="openEdit(item)"
      />
    </ListTransition>

    <EmptyState
      v-else
      :icon="RepeatIcon"
      title="Nessuna spesa ricorrente"
      description="Aggiungi abbonamenti, bollette e pagamenti periodici."
    >
      <Button class="h-11" @click="openCreate">
        <PlusIcon class="size-4" />
        Aggiungi spesa ricorrente
      </Button>
    </EmptyState>

    <RecurringFormDialog v-model:open="dialogOpen" :item="selected" />
  </div>
</template>
