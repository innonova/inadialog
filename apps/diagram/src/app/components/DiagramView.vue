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

/*
 * Public Domain hash function
 * @see https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
const cyrb53a = function(value: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < value.length; i++) {
    ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x85ebca77);
    h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d);
  }
  h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
  h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
  h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;
  return 2097152 * (h2 >>> 0) + (h1 >>> 11);
};
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
                :key="`${cyrb53a(JSON.stringify(shape))}`"
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