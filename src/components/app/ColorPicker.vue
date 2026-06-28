<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'
import { PALETTE } from '@/lib/colors'

defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="grid grid-cols-8 gap-2">
    <button
      v-for="color in PALETTE"
      :key="color"
      type="button"
      class="flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition"
      :class="modelValue === color ? 'ring-2 ring-foreground' : ''"
      :style="{ backgroundColor: color }"
      :aria-label="`Colore ${color}`"
      @click="emit('update:modelValue', color)"
    >
      <CheckIcon v-if="modelValue === color" class="size-4 text-white" />
    </button>
  </div>
</template>
