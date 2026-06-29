<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon, UsersIcon } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import FamilyList from './FamilyList.vue'
import { useFamilyStore } from '@/stores/family.store'

const family = useFamilyStore()
const open = ref(false)
</script>

<template>
  <button
    type="button"
    class="mb-5 flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 text-left shadow-sm transition active:scale-[0.99]"
    @click="open = true"
  >
    <UsersIcon class="size-5 shrink-0 text-muted-foreground" />
    <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ family.familyName }}</span>
    <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
  </button>

  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="max-h-[85svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Le mie famiglie</DialogTitle>
        <DialogDescription>
          Scegli quale famiglia visualizzare o creane una nuova.
        </DialogDescription>
      </DialogHeader>
      <FamilyList @switched="open = false" />
    </DialogContent>
  </Dialog>
</template>
