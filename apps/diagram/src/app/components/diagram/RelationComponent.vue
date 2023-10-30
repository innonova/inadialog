<script setup lang="ts">
import { reactive } from 'vue';

import { path } from '../../composables/curve';
import type { Point } from '../../composables/curve';
import type { ShapeId } from '../../composables/model/shape';
import { saveInject} from '../../composables/provide';

import RelationEndpointComponent from './RelationEndpointComponent.vue';
import { RelationId } from '../../composables/model/relation';

const props = defineProps<{
  id: RelationId,
  from: { id: ShapeId },
  to: { id: ShapeId }
}>();

interface Diagram {
  connect(id: RelationId, shapedId: ShapeId, type: 'start' | 'end'): void
};
const diagram = saveInject<Diagram>('diagram');

const start = reactive<Point>({ x: 0, y: 0 });
const end = reactive<Point>({ x: 0, y: 0 });

const moveStart = (position: Point) => {
  start.x = position.x;
  start.y = position.y;
}
const moveEnd = (position: Point) => {
  end.x = position.x;
  end.y = position.y;
}

const connect = (shapeId: ShapeId, type: 'start' | 'end') => {
  //console.log(`connect relation ${props.id} ${type}point to shape ${shapeId}`);
  diagram?.connect(props.id, shapeId, type);
}
</script>

<template>
    <g data-type="curve">
        <path :d="path(start, end)"></path>
        <RelationEndpointComponent
            :shapeId="from.id"
            type="start"
            @move="moveStart"
            @connect="connect" />
        <RelationEndpointComponent
            :shapeId="to.id"
            type="end"
            @move="moveEnd"
            @connect="connect"/>
    </g>
</template>

<style lang="postcss" scoped>
g path {
    fill: transparent;
    stroke: #222;
    stroke-width: 2;
    pointer-events: stroke;
}
</style>