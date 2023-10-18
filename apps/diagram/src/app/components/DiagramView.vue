<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire';
import { signInAnonymously } from 'firebase/auth';

import { path } from '../composables/curve';
import { useDiagram } from '../composables/diagram';
import { ShapeType } from '../composables/model/shape';

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
const diagram = useDiagram('d3b0f66b-2b74-4b95-84eb-ee9c2b131ffe');

const windowProps = reactive({
  width: parent.innerHeight,
  height: parent.innerHeight
})
const handleResize = () => {
  windowProps.width = parent.innerWidth;
  windowProps.height = parent.innerHeight;
}

const shapes = computed(() => diagram.value?.shapes);
const relations = computed(() => diagram.value?.relations);

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
            <g
                v-for="shape of shapes"
                :key="shape.id"
                :data-type="shape.type"
                :transform="`translate(${shape.x} ${shape.y})`">
                <rect
                    v-if="shape.type === ShapeType.Rectangle"
                    :x="-shape.height / 2"
                    :y="-shape.width / 2"
                    :width="shape.width"
                    :height="shape.height">
                </rect>
                <ellipse
                    v-if="shape.type === ShapeType.Ellipse"
                    :cx="-shape.height / 2"
                    :cy="-shape.width / 2"
                    :rx="shape.width"
                    :ry="shape.height">
                </ellipse>
            </g>
            <g
                v-for="relation of relations"
                :key="relation.id">
                <path :d="path(relation.from, relation.to)"></path>
            </g>
        </g>
    </svg>
</template>

<style lang="postcss" scoped>
g rect, g ellipse {
    fill: transparent;
    stroke: #222;
}
g path {
    fill: transparent;
    stroke: #222;
}
</style>