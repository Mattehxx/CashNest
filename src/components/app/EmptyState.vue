<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ icon?: Component; title: string; description?: string }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center"
  >
    <component :is="icon" v-if="icon" class="mb-3 size-10 text-muted-foreground" />
    <p class="text-base font-semibold">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-xs text-sm text-muted-foreground">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
