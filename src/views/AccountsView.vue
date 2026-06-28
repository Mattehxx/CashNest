<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, WalletIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AccountCard from '@/components/app/AccountCard.vue'
import AccountFormDialog from '@/components/app/AccountFormDialog.vue'
import type { Account } from '@/types'
import { useAccountsStore } from '@/stores/accounts.store'

const accounts = useAccountsStore()
const dialogOpen = ref(false)
const selected = ref<Account | null>(null)

function openCreate(): void {
  selected.value = null
  dialogOpen.value = true
}
function openEdit(account: Account): void {
  selected.value = account
  dialogOpen.value = true
}
</script>

<template>
  <div>
    <PageHeader title="Conti" subtitle="I tuoi metodi di pagamento">
      <template #action>
        <Button size="icon" class="size-10 rounded-full" aria-label="Aggiungi conto" @click="openCreate">
          <PlusIcon class="size-5" />
        </Button>
      </template>
    </PageHeader>

    <div v-if="accounts.loading && !accounts.loaded" class="space-y-2.5">
      <Skeleton v-for="i in 4" :key="i" class="h-[68px] w-full rounded-2xl" />
    </div>

    <div v-else-if="accounts.items.length" class="space-y-2.5">
      <AccountCard
        v-for="account in accounts.items"
        :key="account.id"
        :account="account"
        @select="openEdit(account)"
      />
    </div>

    <EmptyState
      v-else
      :icon="WalletIcon"
      title="Nessun conto"
      description="Aggiungi il primo metodo di pagamento per iniziare."
    >
      <Button class="h-11" @click="openCreate">
        <PlusIcon class="size-4" />
        Aggiungi conto
      </Button>
    </EmptyState>

    <AccountFormDialog v-model:open="dialogOpen" :account="selected" />
  </div>
</template>
