<script setup lang="ts">
import { reactive } from 'vue';

import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';

import RelationEndpointComponent from './RelationEndpointComponent.vue';

const props = defineProps<{
  from: Point,
  to: Point
}>();

const start = reactive(props.from);
const end = reactive(props.to);

const emit = defineEmits<{
  (event: 'moveend', position: { from: Point, to: Point }): void;
}>();

const moveStart = (position: Point) => {
  start.x = position.x;
  start.y = position.y;
}
const moveEnd = (position: Point) => {
  end.x = position.x;
  end.y = position.y;
}
const moved = () => {
  emit('moveend', { from: { x: start.x, y: start.y }, to: { x: end.x, y: end.y }});
}
</script>

<template>
    <g data-type="curve">
        <path :d="path(start, end)"></path>
        <RelationEndpointComponent
            :position="$props.from"
            @move="moveStart"
            @pointerup="moved" />
        <RelationEndpointComponent
            :position="$props.to"
            @move="moveEnd"
            @pointerup="moved"/>
    </g>
</template>

<style lang="postcss" scoped>
g path {
    fill: transparent;
    stroke: #222;
    pointer-events: stroke;
}
</style>