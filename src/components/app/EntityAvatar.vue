<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { DEFAULT_COLOR } from '@/lib/colors'

const props = withDefaults(
  defineProps<{ icon?: string | null; color?: string | null; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)

const color = computed(() => props.color ?? DEFAULT_COLOR)
// 8-digit hex: aggiunge ~12% di opacità al colore di sfondo.
const background = computed(() => `${color.value}20`)

const boxClass = computed(() => ({
  'size-10': props.size === 'sm',
  'size-12': props.size === 'md',
  'size-14': props.size === 'lg',
}))
const iconClass = computed(() => (props.size === 'lg' ? 'size-7' : 'size-6'))
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-2xl"
    :class="boxClass"
    :style="{ backgroundColor: background, color }"
  >
    <AppIcon :name="icon" :class="iconClass" />
  </div>
</template>
