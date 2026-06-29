<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, TagIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import CategoryCard from '@/components/app/CategoryCard.vue'
import CategoryFormDialog from '@/components/app/CategoryFormDialog.vue'
import ListTransition from '@/components/app/ListTransition.vue'
import type { Category } from '@/types'
import { useCategoriesStore } from '@/stores/categories.store'

const categories = useCategoriesStore()
const dialogOpen = ref(false)
const selected = ref<Category | null>(null)

function openCreate(): void {
  selected.value = null
  dialogOpen.value = true
}
function openEdit(category: Category): void {
  selected.value = category
  dialogOpen.value = true
}
</script>

<template>
  <div>
    <PageHeader title="Categorie" subtitle="Per classificare le spese">
      <template #action>
        <Button size="icon" class="size-10 rounded-full" aria-label="Aggiungi categoria" @click="openCreate">
          <PlusIcon class="size-5" />
        </Button>
      </template>
    </PageHeader>

    <div v-if="categories.loading && !categories.loaded" class="space-y-2.5">
      <Skeleton v-for="i in 6" :key="i" class="h-[68px] w-full rounded-2xl" />
    </div>

    <ListTransition v-else-if="categories.items.length">
      <CategoryCard
        v-for="category in categories.items"
        :key="category.id"
        :category="category"
        @select="openEdit(category)"
      />
    </ListTransition>

    <EmptyState
      v-else
      :icon="TagIcon"
      title="Nessuna categoria"
      description="Crea le categorie che usi più spesso."
    >
      <Button class="h-11" @click="openCreate">
        <PlusIcon class="size-4" />
        Aggiungi categoria
      </Button>
    </EmptyState>

    <CategoryFormDialog v-model:open="dialogOpen" :category="selected" />
  </div>
</template>
