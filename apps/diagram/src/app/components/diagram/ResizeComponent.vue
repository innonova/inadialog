<script setup lang="ts">
import { computed, ref } from 'vue';

import { useMovement } from '../../composables/svg-element';

const props = defineProps<{
  height: number,
  width: number
}>();

export type Corner = 'ne' | 'se' | 'sw' | 'nw';

const emit = defineEmits<{
  (event: 'resize', corner: Corner, diff: { x: number, y: number }): void
}>();

const refNE = ref<SVGCircleElement | null>(null);
const positionNE = computed(() => ({ x: props.width / 2, y: -props.height / 2 }));
useMovement(
  refNE,  
  positionNE,
  (diff) => {
    updateSize('ne', { x: diff.x, y: -diff.y })
  }
);
    
const refSE = ref<SVGCircleElement | null>(null);
const positionSE = computed(() => ({ x: props.width / 2, y: props.height / 2 }));
useMovement(
  refSE,
  positionSE,
  (diff) => {
    updateSize('se', { x: diff.x, y: diff.y });
  }
);

const refSW = ref<SVGCircleElement | null>(null);
const positionSW = computed(() => ({ x: -props.width / 2, y: props.height / 2 }));
useMovement(
  refSW,
  positionSW,
  (diff) => {
    updateSize('sw', { x: -diff.x, y: diff.y });
  }
);

const refNW = ref<SVGCircleElement | null>(null);
const positionNW = computed(() => ({ x: -props.width / 2, y: -props.height / 2 }));
useMovement(
  refNW,
  positionNW,
  (diff) => {
    updateSize('nw', { x: -diff.x, y: -diff.y });
  } 
);

const updateSize = (corner: Corner, { x, y }: { x: number, y: number}) => {
  const diff = { x: 0, y: 0 };
  if (props.width + x > 25) {
    diff.x = x;
  }
  if (props.height + y > 25) {
    diff.y = y;
  }
  emit('resize', corner, diff);
}
</script>

<template>
  <g class="resize">
    <circle
      ref="refNE"
      :cx="positionNE.x"
      :cy="positionNE.y"
      :r="25"
      cursor="ne-resize">
    </circle>
    <circle
      :cx="positionNE.x"
      :cy="positionNE.y"
      :r="5">
    </circle>
    <circle
      ref="refSE"
      :cx="positionSE.x"
      :cy="positionSE.y"
      :r="25"
      cursor="se-resize">
    </circle>
    <circle
      :cx="positionSE.x"
      :cy="positionSE.y"
      :r="5">
    </circle>
    <circle
     ref="refSW"
      :cx="positionSW.x"
      :cy="positionSW.y"
      :r="25"
      cursor="sw-resize">
    </circle>
    <circle
      :cx="positionSW.x"
      :cy="positionSW.y"
      :r="5">
    </circle>
    <circle
      ref="refNW"
      :cx="positionNW.x"
      :cy="positionNW.y"
      :r="25"
      cursor="nw-resize">
    </circle>
    <circle
      :cx="positionNW.x"
      :cy="positionNW.y"
      :r="5">
    </circle>
  </g>
</template>

<style type="postcss" scoped>
g.resize circle {
  fill: transparent;
}
g.resize circle:nth-child(even) {
  pointer-events: none;
  stroke: transparent;
  transition: fill 0.4s;
}
g.resize:hover circle:nth-child(even) {
  fill: black;
}
</style>