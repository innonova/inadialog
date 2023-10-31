<script setup lang="ts">
import { onMounted, provide, reactive, ref, toValue, watch } from 'vue';
import type { Ref } from 'vue';
import { useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire';
import { signInAnonymously } from 'firebase/auth';

import { useDiagram } from '../composables/diagram';
import { useHotkeys } from '../composables/hotkeys';
import { Color, ShapeType } from '../composables/model/shape';
import type { ShapeId } from '../composables/model/shape';
import { useMouse } from '../composables/mouse';
import { useShapes } from '../composables/shapes';
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

const createShape = (type: ShapeType) => {
  return () => {
    const { x, y } = toValue(mouse);
    diagram.addShape(type, x, y, Color.White)
  }
}

const filterShape = (...types: string[]) =>
  (element: Element) => types.includes(element.parentElement?.getAttribute('data-type') || '');

const getSelectedShapeId = (): ShapeId | null => {
  const { x, y } = toValue(mouse);
  const element: Element | null = document.elementsFromPoint(x, y)
    .find(filterShape('ellipse', 'rectangle')) || null;
  return element?.parentElement ? +element.parentElement.id as ShapeId : null;
}

const changeColor = (color: Color) => {
  return () => {
    const shapeId: ShapeId | null = getSelectedShapeId();
    if (shapeId !== null) {
      diagram.colorShape(shapeId, color);
    }
  }
}

const svgElement: Ref<SVGSVGElement | null> = ref(null);
const { registerHook } = useHotkeys(svgElement);
// create different shapes
registerHook('e', createShape(ShapeType.Rectangle));
registerHook('q', createShape(ShapeType.Ellipse));

// change color of shape
registerHook('1', changeColor(Color.Red))
registerHook('2', changeColor(Color.Green))
registerHook('3', changeColor(Color.Blue))
registerHook('4', changeColor(Color.Yellow))
registerHook('5', changeColor(Color.White))

const { position: mouse } = useMouse(svgElement);

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