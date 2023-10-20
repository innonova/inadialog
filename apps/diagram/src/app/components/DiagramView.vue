<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire';
import { signInAnonymously } from 'firebase/auth';

import { useDiagram } from '../composables/diagram';
import RelationComponent from './diagram/RelationComponent.vue';
import ShapeComponent from './diagram/ShapeComponent.vue';

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

const windowProps = reactive({
  width: parent.innerHeight,
  height: parent.innerHeight
})
const handleResize = () => {
  windowProps.width = parent.innerWidth;
  windowProps.height = parent.innerHeight;
}

const shapes = diagram.shapes;
const relations = diagram.relations;

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
</script>

<template>
    <svg
        id="diagram"
        data-diagram-id="{{ diagram.id }}"
        :width="windowProps.width"
        :height="windowProps.height"
        xmlns="http://www.w3.org/2000/svg">
        <g id="canvas">
            <ShapeComponent
                v-for="shape of shapes"
                :key="shape.id"
                :type="shape.type"
                :x="shape.x"
                :y="shape.y"
                :height="shape.height"
                :width="shape.width"
                :text="shape.text"
                @moveend="(position) => diagram.moveShape(shape.id, position.x, position.y)"/>
            <RelationComponent
                v-for="relation of relations"
                :key="relation.id"
                :from="relation.from"
                :to="relation.to"/>
        </g>
    </svg>
</template>