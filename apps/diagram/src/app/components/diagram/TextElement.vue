<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { vFocus } from '../../composables/directives';
import { useElementSize } from '../../composables/svg-element';
import { Point } from '../../composables/curve';

interface Props {
  value: string
  edit: boolean
  aligned?: 'left' | 'center' | 'right'
  position?: Point
}
const props = withDefaults(defineProps<Props>(), {
  aligned: 'center',
  position: () => ({ x: 0, y: 0 })
});
defineEmits<{
  (event: 'textchange'): void
  (event: 'textblur', text: string): void
}>();

const font = computed(() => ({
  family: 'Comfortaa',
  size: '22',
  weight: 600
}));

const text = ref<string>(props.value);
const lines = computed(() => text.value.split('\n'));

const textElement = ref<SVGTextElement | null>(null);
const { height, width } = useElementSize(textElement);

defineExpose({
  width,
  height
});
watch(() => props.value, (value) => {
  text.value = value;
});

const aligned = computed(() => props.aligned || 'center');
const anchor = computed(() => {
  switch (props.aligned) {
  case 'left':
    return 'start';
  case 'right':
    return 'end';
  case 'center':
  default:
    return 'middle';
  }
});
const factors = {
  'left': 0,
  'center': 0.5,
  'right': 1
}
const alignedPosition = computed(() => {
  const factor = factors[props.aligned]
  return props.position.x - width.value * factor
});
</script>

<template>
  <text ref="textElement" :y="13 + position.y - height / 2" :text-anchor="anchor">
    <template v-for="(line, index) of lines" :key="index">
      <tspan
        :x="position.x"
        :dy="index > 0 ? '1em' : '0'"
        :visibility="line.length === 0 ? 'hidden' : undefined">
        {{ line.length > 0 ? line : '.' }}
      </tspan>
    </template>
  </text>
  <foreignObject
    v-if="edit"
    :height="height + 8"
    :width="width"
    :transform="`translate(${alignedPosition} ${position.y - height / 2})`">
    <textarea
      v-model="text"
      v-focus
      :style="{ width: width + 'px', height: height + 4 + 'px' }"
      @input.stop="() => $emit('textchange')"
      @keydown.stop
      @keyup.stop
      @blur.stop="$emit('textblur', text)">
    </textarea>
  </foreignObject>
</template>

<style lang="postcss">
text {
  font-family: v-bind('font.family');
  font-size: v-bind('font.size');
  font-weight: v-bind('font.weight');
}
foreignObject textarea {
  border: none;
  background-color: transparent;
  caret-color: black;
  color: transparent;
  font-family: v-bind('font.family');
  font-size: v-bind('font.size');
  font-weight: v-bind('font.weight');
  line-height: 1em;
  outline: none;
  overflow: hidden;
  resize: none;
  padding: 0;
  text-align: v-bind('aligned');
}
</style>