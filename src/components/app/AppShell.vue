<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { RouterView } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomNav from './BottomNav.vue'
import { useFamilyStore } from '@/stores/family.store'
import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRecurringStore } from '@/stores/recurring.store'
import { useRealtimeSync } from '@/composables/useRealtimeSync'

const family = useFamilyStore()
const accounts = useAccountsStore()
const categories = useCategoriesStore()
const recurring = useRecurringStore()
const realtime = useRealtimeSync()

function resetData(): void {
  accounts.reset()
  categories.reset()
  recurring.reset()
}

async function bootstrap(familyId: string): Promise<void> {
  try {
    await Promise.all([
      accounts.fetchAll(familyId),
      categories.fetchAll(familyId),
      recurring.fetchAll(familyId),
    ])
    realtime.start(familyId)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Errore nel caricamento dei dati.')
  }
}

// Avvia/riavvia caricamento dati + Realtime ad ogni cambio di famiglia attiva.
watch(
  () => family.familyId,
  (id) => {
    resetData()
    if (id) void bootstrap(id)
    else realtime.stop()
  },
  { immediate: true },
)

onBeforeUnmount(() => realtime.stop())
</script>

<template>
  <div class="mx-auto flex min-h-svh w-full max-w-md flex-col bg-muted/30">
    <main class="flex-1 px-4 pb-24 pt-5">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <BottomNav />
  </div>
</template>
