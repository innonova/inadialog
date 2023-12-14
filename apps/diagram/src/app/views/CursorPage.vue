<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';

import { useCursor } from '../composables/cursor';

const diagram: Ref<SVGSVGElement | null> = ref(null);

const {
  removeCursor,
  updatePosition,
  changeColor,
  cursor,
  others
} = useCursor(ref('d3b0f66b-2b74-4b95-84eb-ee9c2b131ffe'));
const cursorColor = computed({
  get: () => cursor.value?.color,
  set: (value: string | undefined) => {
    if (value) {
      changeColor(value);
    }
  }
})
const cursorColors = ['black', 'blue', 'green', 'white', 'yellow'];

const dbobj = cursor;
const a = computed(() => console.log('test', diagram.value));

const increment = () => {
  // console.log('test', dbobj.value?.fff);
  // if (dbobj.value) {
  //   dbSet(dbRef(db, 'hhh'), {
  //     fff: dbobj.value.fff + 1,
  //   });
  // }
};

let lastUpdate = performance.now();
const needsUpdate = ref(false);
let lastPos = { x: 0, y: 0 };

const update = (event: PointerEvent) => {
  lastPos = {
    x: Math.floor(event.offsetX),
    y: Math.floor(event.offsetY),
  };
  needsUpdate.value = true;
  if (performance.now() - lastUpdate > 20) {
    lastUpdate = performance.now();
    needsUpdate.value = false;
    // console.log({ x: event.clientX, y: event.clientY });
    //if (dbobj.value) {
    //  dbSet(dbRef(db, 'hhh'), lastPos);
    //}
    updatePosition(lastPos);
  } else {
    needsUpdate.value = true;
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

onMounted(() => {
  console.log('onMounted', diagram.value);
  diagram.value?.addEventListener('pointermove', update);
  addEventListener('beforeunload', removeCursor);
});

onUnmounted(() => {
  console.log('onUnmounted');
  removeCursor();
})

</script>

<template>
  <div class="container">
    <div>
      Position:
      <label>x:</label>{{ dbobj?.x }}
      <label>y:</label>{{ dbobj?.y }}
    </div>
    <div>
      <label>counter:</label>{{ a }}
    </div>
    <div>
      other positions:
      <ul>
        <li
          v-for="pointer of others"
          :key="pointer.id"
        >
          <label>color:</label>{{ pointer.color }}
          <label>x:</label>{{ pointer.x }}
          <label>y:</label>{{ pointer.y }}
        </li>
      </ul>
    </div>
    <button @click="increment()">Inc</button>
    <div id="diagram" ref="diagram">
      <svg
        width="200"
        height="200"
        xmlns="http://www.w3.org/2000/svg">
        <path
          v-for="pointer of others"
          :id="pointer.id"
          :key="pointer.id"
          :transform="`translate(${pointer.x + 12} ${pointer.y + 12})`"
          :fill="pointer.color"
          stroke="1px white"
          d="M -12,-12 l 12,24 l 3,-5 l 5,-3 z" />
      </svg>
      <label>Cursor color:</label><select v-model="cursorColor">
        <option
          v-for="color of cursorColors"
          :key="color">{{ color }}</option>
      </select>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@import '../../assets/css/global.css';

div.container {
  margin: 16px;
}

div.container > div {
  margin: 8px;
}

#diagram {
  position: relative;
  width: 200px;
  height: 200px;
  background-color: red;
}

ul {
  list-style: none;
}

ul li:not(:last-child) {
  margin-bottom: 4px;
}

label {
  margin-right: 4px;
}
</style>
