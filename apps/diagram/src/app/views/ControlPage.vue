<script lang="ts" setup>
import {
  useCurrentUser,
  useFirebaseAuth,
  useIsCurrentUserLoaded,
} from 'vuefire';
import { ref, watch } from 'vue';
import { signInAnonymously } from 'firebase/auth';
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

const diagram = useDiagram(ref('d3b0f66b-2b74-4b95-84eb-ee9c2b131ffe'));

const testAddShape = () => {
  diagram.addShape(ShapeType.Rectangle, 100, 100);
};
const testAddRelation = () => {
  diagram.addRelation(
    diagram.shapes.value[0].id,
    diagram.shapes.value[1].id
  );
};
</script>

<template>
  <pre>{{ JSON.stringify(diagram.diagram.value, undefined, ' ') }}</pre>

  <button @click="testAddShape()">Add Shape</button>
  <button @click="testAddRelation()">Add Relation</button>
</template>

<style lang="postcss">
@import '../../assets/css/global.css';
</style>
