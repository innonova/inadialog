<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import type { Ref, WatchStopHandle } from 'vue';

import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';
import { saveInject} from '../../composables/provide';

import RelationEndpointComponent from './RelationEndpointComponent.vue';
import { RelationId } from '../../composables/model/relation';

type EndpointProps = {
  id: ShapeId,
  style: string,
  text: string,
  x: number,
  y: number
}
const props = defineProps<{
  id: RelationId,
  from: EndpointProps,
  to: EndpointProps
}>();

defineEmits<{
  (event: 'focus', id: number): void
}>();

interface Diagram {
  connect(id: RelationId, shapedId: ShapeId, type: 'start' | 'end'): void
};
const diagram = saveInject<Diagram>('diagram');

interface Shapes {
  getNearestDockingPoint(id: ShapeId, point: Point): Ref<Point>
  getPosition(id: ShapeId): Ref<Point>
}
const shapes = saveInject<Shapes>('shapes');

const mouse = saveInject<Ref<Point>>('mouse');

const start = reactive<Point>({ x: props.from.x, y: props.from.y });
const end = reactive<Point>({ x: props.to.x, y: props.to.y });

const connectEndpoint = (
  shapeId: ShapeId, position: Point, target: Point
): WatchStopHandle => {
  const dockingPoint = shapes.getNearestDockingPoint(shapeId, target);
  return watch(dockingPoint, () => {
    position.x = dockingPoint.value.x;
    position.y = dockingPoint.value.y;
  }, { immediate: true });
}

let watchStart: WatchStopHandle | null = null;
let watchEnd: WatchStopHandle | null = null;

onMounted(() => {
  watchStart = connectEndpoint(props.from.id, start, end);
  watchEnd = connectEndpoint(props.to.id, end, start);

  watch(() => props.from, () => {
    if (watchStart) {
      watchStart();
    }
    start.x = props.from.x;
    start.y = props.from.y;
    watchStart = connectEndpoint(props.from.id, start, end);
  });

  watch(() => props.to, () => {
    if (watchEnd) {
      watchEnd();
    }
    end.x = props.to.x;
    end.y = props.to.y;
    watchEnd = connectEndpoint(props.to.id, end, start);
  });
});

const connect = (shapeId: ShapeId | null, type: 'start' | 'end') => {
  //console.log(`connect relation ${props.id} ${type}point to shape ${shapeId}`);
  if (shapeId) {
    diagram?.connect(props.id, shapeId, type);
  } else {
    // connect to previous endpoint
    if (type === 'start') {
      if (watchStart) {
        watchStart();
      }
      watchStart = connectEndpoint(props.from.id, start, end);
    } else {
      if (watchEnd) {
        watchEnd();
      }
      watchEnd = connectEndpoint(props.to.id, end, start);
    }
  }
}

const disconnect = (type: 'start' | 'end') => {
  if (type === 'start' && watchStart) {
    watchStart();
    watchStart = watch(mouse ,() => {
      // map movement of endpoint to start object
      start.x = mouse.value.x;
      start.y = mouse.value.y;
    });
  }
  if (type === 'end' && watchEnd) {
    watchEnd();
    watchEnd = watch(mouse , () => {
      // map movement of endpoint to end object
      end.x = mouse.value.x;
      end.y = mouse.value.y;
    });
  }
}
</script>

<template>
    <g data-type="curve">
        <path
          :d="path(start, end)"></path>
        <path
          class="handle"
          :d="path(start, end)"
          @click.stop="$emit('focus', $props.id)"></path>
        <RelationEndpointComponent
            :position="start"
            type="start"
            @disconnect="disconnect"
            @connect="connect" />
        <RelationEndpointComponent
            :position="end"
            type="end"
            @disconnect="disconnect"
            @connect="connect"/>
    </g>
</template>

<style lang="postcss" scoped>
g path.handle {
  fill: transparent;
  stroke: transparent;
  stroke-width: 10;
  pointer-events: stroke;
}
g path {
  stroke: #222;
  stroke-width: 2;
  pointer-events: none;
}
</style>