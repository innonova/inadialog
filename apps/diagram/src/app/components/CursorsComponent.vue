<script setup lang="ts">
import type { Cursor } from '../composables/cursor';

type Id = { readonly id: string };

defineProps<{
  cursors: (Cursor & Id)[]
}>();
</script>

<template>
  <defs>
    <path
      id="pointer"
      stroke="1px white"
      d="M -12,-12 l 12,24 l 3,-5 l 5,-3 z"/>
  </defs>
  <use
      v-for="pointer of $props.cursors"
      :id="pointer.id"
      :key="pointer.id"
      href="#pointer"
      :transform="`translate(${pointer.x + 12} ${pointer.y + 12})`"
      :fill="pointer.color" />
</template>