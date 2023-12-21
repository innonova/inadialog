<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { Ref, WatchStopHandle } from 'vue';

import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';
import { saveInject} from '../../composables/provide';

import RelationEndpointComponent from './RelationEndpointComponent.vue';
import { RelationId } from '../../composables/model/relation';
import { DockingPoint, Side } from '../../composables/shapes';
import RelationLabelComponent from './RelationLabelComponent.vue';

type EndpointProps = {
  id: ShapeId,
  style: string,
  text: string,
  x: number,
  y: number
}
const props = defineProps<{
  id: RelationId,
  text: string,
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
  getNearestDockingPoint(id: ShapeId, point: Point): DockingPoint
  getPosition(id: ShapeId): Ref<Point>
}
const shapes = saveInject<Shapes>('shapes');

const mouse = saveInject<Ref<Point>>('mouse');

const start: {
  side: Ref<Side | null>,
  position: Point
} = {
  side: ref(null),
  position: reactive<Point>({ x: props.from.x, y: props.from.y })
};
const end: {
  side: Ref<Side | null>,
  position: Point
} = {
  side: ref(null),
  position: reactive<Point>({ x: props.to.x, y: props.to.y })
};

const connectEndpoint = (
  shapeId: ShapeId, endpoint: { side: Ref<string | null>, position: Point }, target: Point
): WatchStopHandle => {
  const dockingPoint = shapes.getNearestDockingPoint(shapeId, target);
  endpoint.side.value = dockingPoint.side;
  return watch(dockingPoint.position, () => {
    endpoint.position.x = dockingPoint.position.value.x;
    endpoint.position.y = dockingPoint.position.value.y;
  }, { immediate: true });
}

const rotation = (side: Side | null) => {
  if (!side) {
    return 0;
  }
  switch (side) {
  case 'right':
    return 0;
  case 'bottom':
    return 90;
  case 'left':
    return 180;
  case 'top':
    return 270;
  }
}

let watchStart: WatchStopHandle | null = null;
let watchEnd: WatchStopHandle | null = null;

onMounted(() => {
  watchStart = connectEndpoint(props.from.id, start, end.position);
  watchEnd = connectEndpoint(props.to.id, end, start.position);

  watch(() => props.from, () => {
    if (watchStart) {
      watchStart();
    }
    start.position.x = props.from.x;
    start.position.y = props.from.y;
    watchStart = connectEndpoint(props.from.id, start, end.position);
  });

  watch(() => props.to, () => {
    if (watchEnd) {
      watchEnd();
    }
    end.position.x = props.to.x;
    end.position.y = props.to.y;
    watchEnd = connectEndpoint(props.to.id, end, start.position);
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
      watchStart = connectEndpoint(props.from.id, start, end.position);
    } else {
      if (watchEnd) {
        watchEnd();
      }
      watchEnd = connectEndpoint(props.to.id, end, start.position);
    }
  }
}

const disconnect = (type: 'start' | 'end') => {
  if (type === 'start' && watchStart) {
    watchStart();
    watchStart = watch(mouse ,() => {
      // map movement of endpoint to start object
      start.position.x = mouse.value.x;
      start.position.y = mouse.value.y;
    });
  }
  if (type === 'end' && watchEnd) {
    watchEnd();
    watchEnd = watch(mouse , () => {
      // map movement of endpoint to end object
      end.position.x = mouse.value.x;
      end.position.y = mouse.value.y;
    });
  }
}

const d = computed(() => path(start.position, start.side.value, end.position, end.side.value));

const sideOffset = (side: Side | null): Point => {
  switch (side) {
  case 'left':
    return { x: -16, y: -16 };
  case 'right':
    return { x: 32, y: -16 };
  case 'top': 
    return { x: 32, y: -16 };
  case 'bottom':
    return { x: 32, y: 16 };
  default:
    return { x: 0, y: 0 };
  }
}
const startLabelPosition = computed(() => {
  const offset = sideOffset(start.side.value);
  return { x: start.position.x + offset.x, y: start.position.y + offset.y };
});
const endLabelPosition = computed(() => {
  const offset = sideOffset(end.side.value);
  return { x: end.position.x + offset.x, y: end.position.y + offset.y };
});
const position = computed(() => ({
  x: (start.position.x + end.position.x) / 2,
  y: (start.position.y + end.position.y) / 2
}));
</script>

<template>
    <g
      :id="$props.id.toString()"
      data-type="curve">
        <path :d="d"></path>
        <path
          class="handle"
          :d="d"
          @click.stop="$emit('focus', $props.id)"></path>
        <RelationLabelComponent
          :position="startLabelPosition"
          :text="$props.from.text" />
        <RelationLabelComponent
          :position="position"
          :text="$props.text"/>
        <RelationLabelComponent
          :position="endLabelPosition"
          :text="$props.to.text"/>
        <RelationEndpointComponent
            :position="start.position"
            type="start"
            :directed="$props.from.style !== 'none'"
            :rotation="rotation(start.side.value)"
            @disconnect="disconnect"
            @connect="connect" />
        <RelationEndpointComponent
            :position="end.position"
            type="end"
            :directed="$props.to.style !== 'none'"
            :rotation="rotation(end.side.value)"
            @disconnect="disconnect"
            @connect="connect" />
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
g:hover {
  filter: drop-shadow(3px 3px 6px #222);
}
</style>