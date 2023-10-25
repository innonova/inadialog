<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import type { Point } from '../../composables/curve';

import { useMovement } from '../../composables/svg-element';

const props = defineProps<{
  position: Point,
}>();

const emit = defineEmits<{
  (event: 'move', position: Point): void
}>()

const refEndpoint = ref<SVGGElement | null>(null);
const { position } = useMovement(refEndpoint, props.position);

watchEffect(() => {
  emit('move', position.value);
});
</script>

<template>
    <g
        ref="refEndpoint"
        class="endpoint"
        :transform="`translate(${position.x} ${position.y})`">
        <circle :r="25"></circle>
        <circle :r="5"></circle>
    </g>
</template>

<style lang="postcss" scoped>
g circle:first-child {
    fill: transparent;
}
g circle:nth-child(2) {
    pointer-events: none;
    fill: transparent;
}
g:hover circle:nth-child(2) {
    fill: black;
    transition: 0.4s;
}
</style>