<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire';
import { signInAnonymously } from 'firebase/auth';

import DiagramView from '../components/DiagramView.vue';
import MenuComponent from '../components/MenuComponent.vue';
import { createDiagram, useDiagram } from '../composables/diagram';

const props = defineProps<{
  diagramId: string
}>();

const router = useRouter();
const newDiagramId = ref<string>(props.diagramId);
const diagram = useDiagram(newDiagramId);
provide('diagram', diagram);

watch (() => props.diagramId, async (diagramId) => {
  newDiagramId.value = diagramId;
})

const auth = useFirebaseAuth();
const cu = useCurrentUser();
const isLoaded = useIsCurrentUserLoaded();
const checkLogin = () => {
  if (cu.value === null && auth) {
    console.log('login needed');
    signInAnonymously(auth);
  }
};
if (isLoaded.value) {
  checkLogin();
}
watch(isLoaded, () => {
  if (isLoaded.value) {
    checkLogin();
  }
});
watch(cu, () => {
  console.log('user', cu.value?.toJSON());
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
      @clear="clearCanvas"/>
    <DiagramView
      v-if="newDiagramId.length > 0"/>
    <div v-else>
      Load or create new diagram.
    </div>
</template>