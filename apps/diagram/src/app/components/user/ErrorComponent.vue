<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string | null
}>();

const visible = computed(() => props.message);
</script>

<template>
  <div :class="{ visible }">
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
div {
  border: 0px solid #b71c1c;
  color: #b71c1c;
  background: #ffcdd2;
  height: 0;
  transition: height 0.25s;
}
div.visible {
  border-width: 2px;
  height: 100%;
}
p {
  text-align: center;
}
</style>