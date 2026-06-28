<script setup lang="ts">
import { computed } from 'vue'
import { getIconComponent } from '@/lib/icons'

const props = defineProps<{ name?: string | null; class?: string }>()

const IconComponent = computed(() => getIconComponent(props.name))
</script>

<template>
  <component :is="IconComponent" :class="props.class" />
</template>
