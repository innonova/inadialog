<script setup lang="ts">
import { Point } from '../../composables/curve';
import { useState } from '../../composables/state';

import TextElement from './TextElement.vue';

withDefaults(defineProps<{
  position: Point
  text: string
}>(), {
  position: () => ({ x: 0, y: 0 })
})

defineEmits<{
  (event: 'textChanged', text: string): void
}>();

const edit = () => {
  if (state.value !== 'edit') {
    toggleEditState();
  }
}
const { state, toggle: toggleEditState } = useState();

defineExpose({
  edit
})
</script>

<template>
  <g
    v-if="state === 'edit' || $props.text.length > 0"
    @click="edit">
    <TextElement
      :value="$props.text"
      :edit="state === 'edit'"
      :position="$props.position"
      @textchange="() => {}"
      @textblur="(text: string) => {
        toggleEditState();
        $emit('textChanged', text);
      }"/>
  </g>
</template>