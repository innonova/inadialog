<script setup lang="ts">
import { ref, reactive, unref } from 'vue';

import { ShapeType } from '../../composables/model/shape';
import { useMovement } from '../../composables/svg-element';
import ResizeComponent from './ResizeComponent.vue';
import type { Corner } from './ResizeComponent.vue';
import TextElement from './TextElement.vue';

const props = defineProps<{
  type: ShapeType,
  x: number,
  y: number,
  height: number,
  width: number,
  text: string
}>();

defineEmits<{
  (event: 'moveend',
    position: { x: number, y: number },
    size: { height: number, width: number }): void
}>();
const groupRef = ref<SVGGElement | null>(null);
const { position, update } = useMovement(groupRef, () => ({ x: props.x, y: props.y }));

const size = reactive({ height: props.height, width: props.width });

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
</script>

<template>
    <g
        ref="groupRef"
        :data-type="$props.type"
        :transform="`translate(${position.x} ${position.y})`"
        @pointerup="() => {
          $emit('moveend', unref(position), unref(size));
        }">
        <rect
            v-if="$props.type === ShapeType.Rectangle"
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
        <TextElement :value="$props.text" :edit="true"/>
        <ResizeComponent
          :height="size.height"
          :width="size.width"
          @resize="resize"/>
    </g>
</template>

<style lang="postcss" scoped>
g rect, g ellipse {
    fill: transparent;
    stroke: #222;
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