<script setup lang="ts">
import { inject, ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';

import { ShapeId, ShapeType } from '../../composables/model/shape';
import { useMovement } from '../../composables/svg-element';
import ResizeComponent from './ResizeComponent.vue';
import type { Corner } from './ResizeComponent.vue';
import TextElement from './TextElement.vue';

const props = defineProps<{
  id: ShapeId,
  type: ShapeType,
  x: number,
  y: number,
  height: number,
  width: number,
  text: string
}>();

interface Diagram {
  moveShape(id: ShapeId, x: number, y: number, height: number, width: number): void
  setShapeText(shapeId: ShapeId, text: string ): void
}
interface Shapes {
  register(id: ShapeId, position: Ref<{ x: number, y: number }>): void
  unregister(id: ShapeId): void
}
const diagram = inject<Diagram>('diagram');
const shapes = inject<Shapes>('shapes');

const groupRef = ref<SVGGElement | null>(null);
const { position, update } = useMovement(groupRef, () => ({ x: props.x, y: props.y }));

const size = reactive({ height: props.height, width: props.width });
watch(() => ({ height: props.height, width: props.width }), (value) => {
  size.height = value.height;
  size.width = value.width;
});

const resize = (corner: Corner, diff: { x: number, y: number }) => {
  update({ x: diff.x / 2, y: diff.y / 2 });
  switch (corner) {
  case 'ne':
    size.width = size.width + diff.x;
    size.height = size.height - diff.y;
    break;
  case 'se':
    size.width = size.width + diff.x;
    size.height = size.height + diff.y;
    break;
  case 'sw':
    size.width = size.width - diff.x;
    size.height = size.height + diff.y;
    break;
  case 'nw':
    size.width = size.width - diff.x;
    size.height = size.height - diff.y;
    break;
  }
}

const commitMove = () => {
  diagram?.moveShape(props.id, position.value.x, position.value.y, size.height, size.width);
};

onMounted(() => {
  shapes?.register(props.id, position);
})

onUnmounted(() => {
  shapes?.unregister(props.id);
})
</script>

<template>
    <g
        :id="$props.id.toString()"
        ref="groupRef"
        class="white"
        :data-type="$props.type"
        :transform="`translate(${position.x} ${position.y})`"
        @pointerup="commitMove">
        <rect
            v-if="$props.type === ShapeType.Rectangle"
            rx="15"
            :x="-size.width / 2"
            :y="-size.height / 2"
            :width="size.width"
            :height="size.height">
        </rect>
        <ellipse
            v-if="$props.type === ShapeType.Ellipse"
            :rx="size.width * Math.SQRT1_2"
            :ry="size.height * Math.SQRT1_2">
        </ellipse>
        <TextElement
          :value="$props.text"
          :edit="true"
          @textchange="(text) => diagram?.setShapeText($props.id, text)"/>
        <ResizeComponent
          :height="size.height"
          :width="size.width"
          @resize="resize"/>
    </g>
</template>

<style lang="postcss" scoped>
g rect, g ellipse {
    fill: white;
    stroke: #222;
}
g.white:hover rect, g.white:hover ellipse {
  filter: drop-shadow(3px 3px 6px #222);
}
g circle.resize-ne {
  cursor: ne-resize;
}
g circle.resize-se {
  cursor: se-resize;
}
g circle.resize-sw {
  cursor: sw-resize;
}
</style>