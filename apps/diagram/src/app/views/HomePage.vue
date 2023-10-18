<script lang="ts" setup>
import {
  useCurrentUser,
  useDatabase,
  useDatabaseObject,
  useFirebaseAuth,
  useIsCurrentUserLoaded,
} from 'vuefire';
import { ref as dbRef, set as dbSet } from 'firebase/database';
import { Ref, computed, onMounted, ref, watch } from 'vue';
import { signInAnonymously } from 'firebase/auth';
const db = useDatabase();
const diagram: Ref<SVGSVGElement | null> = ref(null);
const pointer: Ref<SVGSVGElement | null> = ref(null);

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

// const test = async () => {
//   // const citiesCol = collection(db, 'todos');
//   // const citySnapshot = await getDocs(citiesCol);
//   console.log(citySnapshot);
// };
// const starCountRef = dbRef(db, 'hhh');
// onValue(starCountRef, (snapshot) => {
//   const data = snapshot.val();
//   console.log(data);
// });

// const todos = useCollection(collection(db, 'todos'));
// const a = computed(() => console.log(todos));
// test();
const dbobj = useDatabaseObject<{ x: number; y: number }>(dbRef(db, 'hhh'));
const a = computed(() => console.log('test', diagram.value));

const left: Ref<string> = computed(() =>
  dbobj.value ? `${dbobj.value?.x}px` : left.value
);
const top: Ref<string> = computed(() => `${dbobj.value?.y}px`);

const increment = () => {
  // console.log('test', dbobj.value?.fff);
  // if (dbobj.value) {
  //   dbSet(dbRef(db, 'hhh'), {
  //     fff: dbobj.value.fff + 1,
  //   });
  // }
};

let lastUpdate = performance.now();
let needsUpdate = false;
let lastPos = { x: 0, y: 0 };

const update = (event: PointerEvent) => {
  lastPos = {
    x: Math.floor(event.offsetX),
    y: Math.floor(event.offsetY),
  };
  needsUpdate = true;
  if (performance.now() - lastUpdate > 20) {
    lastUpdate = performance.now();
    needsUpdate = false;
    // console.log({ x: event.clientX, y: event.clientY });
    if (dbobj.value) {
      dbSet(dbRef(db, 'hhh'), lastPos);
    }
  } else {
    needsUpdate = true;
  }
};

// setInterval(() => {
//   if (needsUpdate && performance.now() - lastUpdate > 100) {
//     lastUpdate = performance.now();
//     needsUpdate = false;
//     // console.log('update', lastPos);
//     if (dbobj.value) {
//       if (dbobj.value) {
//         dbSet(dbRef(db, 'hhh'), lastPos);
//       }
//     }
//   }
// }, 10);

Object.entries({});

onMounted(() => {
  console.log('onMounted', diagram.value);
  diagram.value?.addEventListener('pointermove', update);
});

// const { position, registerHook: registerMouseHook } = useMouse(diagram);
</script>

<template>
  <div>{{ dbobj?.x }}, {{ dbobj?.y }}</div>
  <div>{{ a }}</div>
  <!-- <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span>{{ todo.text }}</span>
    </li>
  </ul> -->
  <button @click="increment()">Inc</button>
  <div id="diagram" ref="diagram">
    <div id="pointer" ref="pointer"></div>
  </div>
</template>

<style lang="postcss" scoped>
@import '../../assets/css/global.css';
#diagram {
  position: relative;
  width: 200px;
  height: 200px;
  background-color: red;
}

#pointer {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  left: v-bind('left');
  top: v-bind('top');
  pointer-events: none;
  /* transition: left 0.1s, top 0.1s; */
}
</style>
