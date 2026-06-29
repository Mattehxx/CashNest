<script setup lang="ts">
// Wrapper per animare entrata/uscita/riordino degli elementi di una lista.
// I figli devono avere una `:key` (richiesto da TransitionGroup).
withDefaults(defineProps<{ tag?: string }>(), { tag: 'div' })
</script>

<template>
  <TransitionGroup :tag="tag" name="list" class="relative flex flex-col gap-2.5">
    <slot />
  </TransitionGroup>
</template>
