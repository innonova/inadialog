<script lang="ts" setup>
import {
  useCurrentUser,
  useFirebaseAuth,
  useIsCurrentUserLoaded,
} from 'vuefire';
import { watch } from 'vue';
import { signInAnonymously } from 'firebase/auth';
import {
  createDiagram,
  useDiagram,
  addShape,
  addRelation,
} from '../composables/diagram';

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
watch(diagram, () => {
  if (diagram.value === null) {
    createDiagram('d3b0f66b-2b74-4b95-84eb-ee9c2b131ffe');
  }
});

const testAddShape = () => {
  if (diagram.value) {
    addShape(diagram.value);
  }
};
const testAddRelation = () => {
  if (diagram.value) {
    addRelation(
      diagram.value,
      diagram.value.shapes[0].id,
      diagram.value.shapes[1].id
    );
  }
};
</script>

<template>
  <pre>{{ JSON.stringify(diagram, undefined, ' ') }}</pre>

  <button @click="testAddShape()">Add Shape</button>
  <button @click="testAddRelation()">Add Relation</button>
</template>

<style lang="postcss">
@import '../../assets/css/global.css';
</style>
