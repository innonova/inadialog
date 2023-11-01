<script setup lang="ts">

import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';

const props = defineProps<{
  position: Point,
  type: 'start' | 'end'
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

const dropEndpoint = () => {
  const shapeGroup = document.elementsFromPoint(props.position.x, props.position.y)
    .find(shape('rectangle', 'ellipse'))?.parentElement || null;
  emit('connect', shapeGroup ? +shapeGroup.id as ShapeId : null, props.type)
};

</script>

<template>
    <g
        class="endpoint"
        :transform="`translate(${$props.position.x} ${$props.position.y})`"
        @pointerdown.stop="disconnect"
        @pointerup.stop="dropEndpoint">
        <circle :r="25"></circle>
        <circle :r="5"></circle>
    </g>
</template>

<style lang="postcss" scoped>
g.endpoint circle:first-child {
  fill: transparent;
}
g.endpoint circle:nth-child(2) {
  pointer-events: none;
  fill: transparent;
  transition: fill 0.4s;
}
g.endpoint:hover circle:nth-child(2) {
  fill: black;
}
</style>