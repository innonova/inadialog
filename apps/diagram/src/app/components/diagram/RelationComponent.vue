<script setup lang="ts">
import { ref } from 'vue';

import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';

import { useMovement } from '../../composables/svg-element';

const props = defineProps<{
  from: Point,
  to: Point
}>();

const emit = defineEmits<{
  (event: 'moveend', position: { from: Point, to: Point }): void
}>()

const refStartPoint = ref<SVGGElement | null>(null);
const { position: start } = useMovement(refStartPoint, props.from);

const refEndPoint = ref<SVGGElement | null>(null);
const { position: end } = useMovement(refEndPoint, props.to);

const moveend = () => {
  emit('moveend', { from: { x: start.x, y: start.y }, to: { x: end.x, y: end.y }});
}
</script>

<template>
    <g data-type="curve">
        <path :d="path(start, end)"></path>
        <g
            ref="refStartPoint"
            class="endpoint"
            :transform="`translate(${start.x} ${start.y})`"
            @pointerup="moveend">
            <circle :r="25"></circle>
            <circle :r="5"></circle>
        </g>
        <g
            ref="refEndPoint"
            class="endpoint"
            :transform="`translate(${end.x} ${end.y})`"
            @pointerup="moveend">
            <circle :r="25"></circle>
            <circle :r="5"></circle>
        </g>
    </g>
</template>

<style lang="postcss" scoped>
g path {
    fill: transparent;
    stroke: #222;
    pointer-events: stroke;
}
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