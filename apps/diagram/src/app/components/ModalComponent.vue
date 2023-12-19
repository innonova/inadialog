<script setup lang="ts">

import { ref } from 'vue';

interface DialogElement extends HTMLDialogElement {
  showModal: () => void;
  close: (returnValue?: string) => void;
}

defineExpose({
  showModal
});

const emit = defineEmits<{
  (e: 'close', value: Event): void;
  (e: 'confirm', value: Event): void;
}>();

const dialogElement = ref<DialogElement | null>(null);

function showModal() {
  dialogElement?.value?.showModal();
}

function closeModal() {
  dialogElement?.value?.close();
}

function onClose(e: Event) {
  emit('close', e);
}

function confirm(e: Event) {
  e.preventDefault();
  dialogElement?.value?.close();
  emit('confirm', e);
}
</script>

<template>
  <dialog ref="dialogElement" @close="onClose">
    <button class="close" @click="closeModal">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <form>
      <div class="flex flex-col my-4">
        <slot />
      </div>
      <div class="button-bar">
        <button class="rounded-b-lg px-8 py-2" value="confirm" @click="confirm">OK</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped type="postcss">
dialog {
  position: relative;
  width: 50%;
  border-radius: 5px;
}
button.close {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 0;
  height: 24px;
  width: 24px;
}

form div {
  display: flex;
  flex-direction: column;
  margin: 0 4px;
}

div.button-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 4px;
}
</style>
