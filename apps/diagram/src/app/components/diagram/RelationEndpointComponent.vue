<script setup lang="ts">
import { onMounted, reactive, ref, toValue, watchEffect } from 'vue';
import type { MaybeRefOrGetter, Ref, WatchStopHandle } from 'vue';

import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';
import { saveInject} from '../../composables/provide';

import { useMovement } from '../../composables/svg-element';

const props = defineProps<{
  shapeId: MaybeRefOrGetter<ShapeId>,
  type: 'start' | 'end'
}>();

const emit = defineEmits<{
  (event: 'move', position: Point): void
  (event: 'connect', shapeId: ShapeId, type: 'start' | 'end'): void
}>()

interface Shapes {
  getPosition(id: ShapeId): Ref<{ x: number, y: number}>
}
const shapes = saveInject<Shapes>('shapes');

const refEndpoint = ref<SVGGElement | null>(null);
const position = reactive({ x: 0, y: 0 });
const { movement } = useMovement(refEndpoint, position);

const shape = (...types: string[]) =>
  (element: Element) => types.includes(element.parentElement?.getAttribute('data-type') || '');

const disconnect = () => {
  stopIdTracking();
  stopWatch();
  stopWatch = watchEffect(() => {
    position.x = position.x + movement.value.x;
    position.y = position.y + movement.value.y;
    emit('move', position);
  });
}

const dropEndpoint = () => {
  const shapeGroup = document.elementsFromPoint(position.x, position.y)
    .find(shape('rectangle', 'ellipse'))?.parentElement;
  if (!shapeGroup) {
    return;
  }
  const shapePositionRef = shapes.getPosition(+shapeGroup.id as ShapeId);
  if (shapePositionRef) {
    stopWatch();
    stopWatch = watchEffect(() => {
      const shapePosition = shapes.getPosition(toValue(props.shapeId));
      position.x = shapePosition.value.x;
      position.y = shapePosition.value.y;
      emit('move', position);
    });
    emit('connect', +shapeGroup.id as ShapeId, props.type);
    stopIdTracking = trackShapeId(props.shapeId);
  }
};

const trackShapeId = (shapeId: MaybeRefOrGetter) => watchEffect(() => {
  console.log(`${props.type}point connected to shape: `, toValue(shapeId));
});

let stopWatch: WatchStopHandle;
let stopIdTracking: WatchStopHandle;
onMounted(() => {
  stopIdTracking = trackShapeId(props.shapeId);
  stopWatch = watchEffect(() => {
    const shapePosition = shapes.getPosition(toValue(props.shapeId))
    position.x = shapePosition.value.x + movement.value.x;
    position.y = shapePosition.value.y + movement.value.y;
    emit('move', position);
  });
});
</script>

<template>
    <g
        ref="refEndpoint"
        class="endpoint"
        :transform="`translate(${position.x} ${position.y})`"
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