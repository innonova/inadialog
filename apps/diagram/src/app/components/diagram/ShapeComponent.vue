<script setup lang="ts">
import { onMounted, reactive, ref, unref } from 'vue';

import { ShapeType } from '../../composables/model/shape';
import TextElement from './TextElement.vue';

const props = defineProps<{
  type: ShapeType,
  x: number,
  y: number,
  height: number,
  width: number,
  text: string
}>();

const emit = defineEmits<{
  (event: 'moveend', position: { x: number, y: number }): void
}>();
const position = reactive({x: props.x, y: props.y});
const groupRef = ref<SVGGElement | null>(null);
onMounted(() => {
  const group = unref(groupRef);
  if (group) {
    group.addEventListener('pointerdown', (event: PointerEvent) => {
      let startPosition = { x: event.clientX, y: event.clientY };
      
      const move = (event: PointerEvent) => {
        position.x = position.x + (event.clientX - startPosition.x);
        position.y = position.y + (event.clientY - startPosition.y);
        startPosition = { x: event.clientX, y: event.clientY };
      }

      group.addEventListener('pointermove', move);
      group.addEventListener('pointerup', () => {
        group.removeEventListener('pointermove', move);
        emit('moveend', unref(position));
      }, { once: true });
    });
  } 
});
</script>

<template>
    <g
        ref="groupRef"
        :data-type="$props.type"
        :transform="`translate(${position.x} ${position.y})`">
        <rect
            v-if="$props.type === ShapeType.Rectangle"
            :x="-$props.height / 2"
            :y="-$props.width / 2"
            :width="$props.width"
            :height="$props.height">
        </rect>
        <ellipse
            v-if="$props.type === ShapeType.Ellipse"
            :rx="$props.width"
            :ry="$props.height">
        </ellipse>
        <TextElement :value="$props.text" :edit="true"/>
    </g>
</template>

<style lang="postcss" scoped>
g rect, g ellipse {
    fill: transparent;
    stroke: #222;
}
</style>