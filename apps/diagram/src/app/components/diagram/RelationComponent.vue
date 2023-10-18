<script setup lang="ts">
import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';

defineProps<{
  from: Point,
  to: Point
}>();
</script>

<template>
    <g>
        <path :d="path($props.from, $props.to)"></path>
    </g>
</template>

<style lang="postcss" scoped>
g path {
    fill: transparent;
    stroke: #222;
}
</style>