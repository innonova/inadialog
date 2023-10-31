<script setup lang="ts">
import { onMounted, provide, reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire';
import { signInAnonymously } from 'firebase/auth';

import { useDiagram } from '../composables/diagram';
import RelationComponent from './diagram/RelationComponent.vue';
import ShapeComponent from './diagram/ShapeComponent.vue';
import { useShapes } from '../composables/shapes';
import { useHotkeys } from '../composables/hotkeys';

const props = defineProps<{
  diagramId: string
}>();

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
const diagram = useDiagram(props.diagramId);
provide('diagram', diagram);

provide('shapes', useShapes());

const windowProps = reactive({
  width: parent.innerWidth,
  height: parent.innerHeight
})
const handleResize = () => {
  windowProps.width = parent.innerWidth;
  windowProps.height = parent.innerHeight;
}

const svgElement: Ref<SVGSVGElement | null> = ref(null);
useHotkeys(svgElement);

const shapes = diagram.shapes;
const relations = diagram.relations;

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
</script>

<template>
    <svg
        id="diagram"
        ref="svgElement"
        tabindex="0"
        data-diagram-id="{{ diagram.id }}"
        :width="windowProps.width"
        :height="windowProps.height"
        xmlns="http://www.w3.org/2000/svg">
        <g id="canvas">
            <ShapeComponent
                v-for="shape of shapes"
                :key="shape.id"
                v-bind="shape"/>
            <RelationComponent
                v-for="relation of relations"
                :key="relation.id"
                v-bind="relation"/>
        </g>
    </svg>
</template>