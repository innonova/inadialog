<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMovement } from '../../composables/svg-element';

const props = defineProps<{
  height: number,
  width: number
}>();

export type Corner = 'ne' | 'se' | 'sw' | 'nw';

const emit = defineEmits<{
  (event: 'resize', corner: Corner, diff: { x: number, y: number }): void
}>();

const size = ref({ height: props.height, width: props.width });

const refNE = ref<SVGCircleElement | null>(null);
const { position: positionNE, movement: diffNE } = useMovement(
  refNE, () => ({ x: size.value.width / 2, y: -size.value.height / 2 }));

const refSE = ref<SVGCircleElement | null>(null);
const { position: positionSE, movement: diffSE } = useMovement(
  refSE, () => ({ x: size.value.width / 2, y: size.value.height / 2 }));

const refSW = ref<SVGCircleElement | null>(null);
const { position: positionSW, movement: diffSW } = useMovement(
  refSW, () => ({ x: -size.value.width / 2, y: size.value.height / 2 }));

const refNW = ref<SVGCircleElement | null>(null);
const { position: positionNW, movement: diffNW } = useMovement(
  refNW, () => ({ x: -size.value.width / 2, y: -size.value.height / 2 }));

watch(diffNE, (diff) => {
  size.value = { height: size.value.height - diff.y, width: size.value.width + diff.x };
  emit('resize', 'ne', diff);
})
watch(diffSE, (diff) => {
  size.value = { height: size.value.height + diff.y, width: size.value.width + diff.x };
  emit('resize', 'se', diff);
})
watch(diffSW, (diff) => {
  size.value = { height: size.value.height + diff.y, width: size.value.width - diff.x };
  emit('resize', 'sw', diff);
})
watch(diffNW, (diff) => {
  size.value = { height: size.value.height - diff.y, width: size.value.width - diff.x };
  emit('resize', 'nw', diff);
})
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