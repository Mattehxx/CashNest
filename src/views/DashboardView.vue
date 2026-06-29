<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { LogOutIcon, RepeatIcon, SettingsIcon, TagIcon, WalletIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import RecurringCard from '@/components/app/RecurringCard.vue'
import { formatCurrency } from '@/composables/useCurrency'
import { toMonthlyAmount } from '@/composables/useFrequency'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'
import { useAccountsStore } from '@/stores/accounts.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRecurringStore } from '@/stores/recurring.store'

const router = useRouter()
const auth = useAuthStore()
const family = useFamilyStore()
const accounts = useAccountsStore()
const categories = useCategoriesStore()
const recurring = useRecurringStore()

const monthlyTotal = computed(() =>
  recurring.items
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + toMonthlyAmount(r.amount, r.frequency), 0),
)
const activeCount = computed(() => recurring.items.filter((r) => r.isActive).length)
const recentRecurring = computed(() => recurring.items.slice(0, 4))

const greetingName = computed(() => {
  const member = family.members.find((m) => m.profileId === auth.user?.id)
  const email = auth.user?.email ?? ''
  return member?.profile?.fullName || email.split('@')[0] || ''
})

const tiles = computed(() => [
  { name: 'accounts', label: 'Conti', icon: WalletIcon, count: accounts.items.length },
  { name: 'categories', label: 'Categorie', icon: TagIcon, count: categories.items.length },
  { name: 'recurring', label: 'Ricorrenti', icon: RepeatIcon, count: recurring.items.length },
])

async function logout(): Promise<void> {
  await auth.signOut()
  family.reset()
  accounts.reset()
  categories.reset()
  recurring.reset()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div>
    <header class="mb-5 flex items-center justify-between">
      <div class="min-w-0">
        <p class="text-sm text-muted-foreground">Bentornato</p>
        <h1 class="truncate text-2xl font-bold capitalize">{{ greetingName }}</h1>
      </div>
      <div class="flex items-center gap-1">
        <Button
          v-if="family.isAdmin"
          as-child
          variant="ghost"
          size="icon"
          class="size-10"
          aria-label="Gestione"
        >
          <RouterLink :to="{ name: 'admin' }">
            <SettingsIcon class="size-5" />
          </RouterLink>
        </Button>
        <Button variant="ghost" size="icon" class="size-10" aria-label="Esci" @click="logout">
          <LogOutIcon class="size-5" />
        </Button>
      </div>
    </header>

    <div class="mb-5 rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
      <p class="text-sm opacity-90">Spese ricorrenti stimate</p>
      <p class="mt-1 text-3xl font-bold tabular-nums">
        {{ formatCurrency(monthlyTotal) }}<span class="text-base font-medium opacity-80"> /mese</span>
      </p>
      <p class="mt-1 text-sm opacity-80">
        {{ activeCount }} {{ activeCount === 1 ? 'voce attiva' : 'voci attive' }}
      </p>
    </div>

    <div class="mb-6 grid grid-cols-3 gap-3">
      <RouterLink
        v-for="tile in tiles"
        :key="tile.name"
        :to="{ name: tile.name }"
        class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition active:scale-[0.98]"
      >
        <div class="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
          <component :is="tile.icon" class="size-5" />
        </div>
        <span class="text-xs font-medium text-muted-foreground">{{ tile.label }}</span>
        <span class="text-lg font-bold leading-none tabular-nums">{{ tile.count }}</span>
      </RouterLink>
    </div>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-semibold">Spese ricorrenti</h2>
        <RouterLink :to="{ name: 'recurring' }" class="text-sm font-medium text-primary">
          Vedi tutte
        </RouterLink>
      </div>

      <div v-if="recentRecurring.length" class="space-y-2.5">
        <RecurringCard
          v-for="r in recentRecurring"
          :key="r.id"
          :item="r"
          @select="router.push({ name: 'recurring' })"
        />
      </div>
      <p
        v-else
        class="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        Nessuna spesa ricorrente. Aggiungine una dalla sezione Ricorrenti.
      </p>
    </section>
  </div>
</template>
