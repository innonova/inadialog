<script setup lang="ts">

import { useCanvas } from '../../composables/canvas';
import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';

const props = defineProps<{
  position: Point,
  type: 'start' | 'end',
  directed: boolean,
  rotation: 0 | 90 | 180 | 270
}>();

const emit = defineEmits<{
  (event: 'connect', shapeId: ShapeId | null, type: 'start' | 'end'): void
  (event: 'disconnect', type: 'start' | 'end'): void
}>()

const disconnect = () => {
  emit('disconnect', props.type);
}

const shape = (...types: string[]) =>
  (element: Element) => types.includes(element.parentElement?.getAttribute('data-type') || '');

const { toScreen } = useCanvas();
const dropEndpoint = () => {
  const screenPoint = toScreen(props.position);
  const shapeGroup = document.elementsFromPoint(screenPoint.x, screenPoint.y)
    .find(shape('rectangle', 'ellipse'))?.parentElement || null;
  emit('connect', shapeGroup ? +shapeGroup.id as ShapeId : null, props.type)
};
</script>

<template>
    <g
        :class="{ directed }"
        class="endpoint"
        :transform="`translate(${$props.position.x} ${$props.position.y}) rotate(${rotation})`"
        @pointerdown.stop="disconnect"
        @pointerup.stop="dropEndpoint">
        <circle :r="25"></circle>
        <path></path>
    </g>
</template>

<style lang="postcss" scoped>
g.endpoint circle {
  fill: transparent;
}
g.endpoint path {
  pointer-events: none;
  fill: transparent;
  transition: fill 0.4s;
}
g[data-type="curve"]:hover g.endpoint:not(.directed) path {
  d: path('M 5,1 A 5 5 1 1 1 5,-1 z');
  fill: black;
}
g.endpoint.directed path {
  d: path('M 10,10 L 0, 0 L 10, -10');
}
</style>