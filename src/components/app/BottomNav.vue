<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { HouseIcon, RepeatIcon, TagIcon, WalletIcon } from '@lucide/vue'

const route = useRoute()

const items = [
  { name: 'dashboard', label: 'Home', icon: HouseIcon },
  { name: 'accounts', label: 'Conti', icon: WalletIcon },
  { name: 'categories', label: 'Categorie', icon: TagIcon },
  { name: 'recurring', label: 'Ricorrenti', icon: RepeatIcon },
]

const isActive = (name: string) => route.name === name
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="mx-auto flex w-full max-w-md items-stretch justify-around">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
        :class="isActive(item.name) ? 'text-primary' : 'text-muted-foreground'"
      >
        <component :is="item.icon" class="size-6" :stroke-width="isActive(item.name) ? 2.4 : 2" />
        <span class="text-[11px] font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
