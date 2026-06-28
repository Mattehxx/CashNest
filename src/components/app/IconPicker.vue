<script setup lang="ts">
import { getIconComponent, ICON_NAMES } from '@/lib/icons'

defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="grid max-h-44 grid-cols-6 gap-2 overflow-y-auto pr-1">
    <button
      v-for="name in ICON_NAMES"
      :key="name"
      type="button"
      class="flex size-10 items-center justify-center rounded-xl border transition"
      :class="
        modelValue === name
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/70'
      "
      :aria-label="`Icona ${name}`"
      @click="emit('update:modelValue', name)"
    >
      <component :is="getIconComponent(name)" class="size-5" />
    </button>
  </div>
</template>
