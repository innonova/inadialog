<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

import ModalComponent from './ModalComponent.vue'

import type { Visibility } from '../composables/diagram';

const show = () => {
  modal.value?.showModal();
}
defineExpose({
  show
});

const emit = defineEmits<{
  ( event: 'change-visibility', visibility: Visibility): void 
}>();

const props = defineProps<{
  diagramId: string
  visibility: Visibility
}>()

const modal: Ref<InstanceType<typeof ModalComponent> | null> = ref(null);

const visibility = ref(props.visibility);
const commitChanges = () => {
  emit('change-visibility', visibility.value);
}
const reset = () => {
  visibility.value = props.visibility;
}
</script>

<template>
    <ModalComponent
      ref="modal"
      @confirm="commitChanges"
      @close="reset">
        <h2>Settings</h2>
        <div class="row">
          <label>Diagram Id:</label>
          <span>{{ diagramId }}</span>
        </div>
        <div class="row">
          <label>Visibility:</label>
          <select v-model="visibility">
              <option value='private'>
                private
              </option>
              <option value='public'>
                public
              </option>
          </select>
        </div>
    </ModalComponent>
</template>

<style scoped>
div.row {
  width: 100%;
}
div.row:not(:last-child) {
  margin-bottom: 0.5em;
}
div.row label {
  display: inline-block;
  width: 30%;
}
div.row select {
  width: auto;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
</style>