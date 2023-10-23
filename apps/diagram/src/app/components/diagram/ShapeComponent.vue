<script setup lang="ts">
import { ref, unref } from 'vue';

import { ShapeType } from '../../composables/model/shape';
import { useMovement } from '../../composables/svg-element';
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
  (event: 'moveend', position: { x: number, y: number }): void
}>();
const groupRef = ref<SVGGElement | null>(null);
const { position } = useMovement(groupRef, { x: props.x, y: props.y });
</script>

<template>
    <g
        ref="groupRef"
        :data-type="$props.type"
        :transform="`translate(${position.x} ${position.y})`"
        @pointerup="() => $emit('moveend', unref(position))">
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