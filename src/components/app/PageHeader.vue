<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header class="mb-5 flex items-start justify-between gap-3">
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="mt-0.5 text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
    <div class="shrink-0">
      <slot name="action" />
    </div>
  </header>
</template>
