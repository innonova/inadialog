<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { useRouter } from 'vue-router';

import DiagramView from '../components/DiagramView.vue';
import MenuComponent from '../components/MenuComponent.vue';
import { useCursor } from '../composables/cursor';
import { createDiagram, useDiagram } from '../composables/diagram';

const props = defineProps<{
  diagramId: string
}>();

const router = useRouter();
const newDiagramId = ref<string>(props.diagramId);
const diagram = useDiagram(newDiagramId);
provide('diagram', diagram);

const cursor = useCursor(() => newDiagramId.value);
provide('cursor', cursor);

watch (() => props.diagramId, async (diagramId) => {
  newDiagramId.value = diagramId;
});

const newCanvas = async () => {
  const diagramId = await createDiagram();
  await router.push({
    name: 'View',
    params: {
      diagramId
    }
  });
}

const clearCanvas = () => {
  diagram.clear();
}
</script>

<template>
    <MenuComponent
      @new="newCanvas"
      @clear="clearCanvas"
      @change-cursor-color="(color: string) => cursor.changeColor(color)"/>
    <DiagramView
      v-if="newDiagramId.length > 0"/>
    <div v-else>
      Load or create new diagram.
    </div>
</template>