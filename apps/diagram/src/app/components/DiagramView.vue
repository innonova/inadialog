<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref, toValue, watch } from 'vue';
import type { Ref } from 'vue';

import { useCanvas } from '../composables/canvas';
import type { UseDiagram } from '../composables/diagram';
import { useHotkeys } from '../composables/hotkeys';
import { Direction, Relation, RelationId } from '../composables/model/relation';
import { Color, ShapeType } from '../composables/model/shape';
import type { ShapeId } from '../composables/model/shape';
import { useMouse } from '../composables/mouse';
import { saveInject } from '../composables/provide';
import { useShapes } from '../composables/shapes';
import RelationComponent from './diagram/RelationComponent.vue';
import ShapeComponent from './diagram/ShapeComponent.vue';
import { path, position } from '../composables/curve';

const diagram = saveInject<UseDiagram>('diagram')

const shapeStore = useShapes();
provide('shapes', shapeStore);

const windowProps = reactive({
  width: parent.innerWidth,
  height: parent.innerHeight
})
const handleResize = () => {
  windowProps.width = parent.innerWidth;
  windowProps.height = parent.innerHeight;
}

type ShapeProperties = {
  id: ShapeId,
  type: ShapeType,
  height: number,
  width: number,
  x: number,
  y: number,
  color: Color,
  text: string
}
const transientShape: Ref<ShapeProperties | null> = ref(null);
const createShape = (type: ShapeType) => {
  return () => {
    const stopWatch = watch(mouse, ({ x, y }) => {
      transientShape.value = {
        id: 999999 as ShapeId,
        type,
        height: 50,
        width: 50,
        x,
        y,
        text: '',
        color: Color.White
      }
    });

    return () => {
      stopWatch();
      transientShape.value = null;
      const { x, y } = toValue(mouse); 
      diagram.addShape(type, x, y, Color.White);
    }
  }
}

const removeShapeOrRelation = () => {
  const shape = getSelectedShape();
  if (!shape) {
    return;
  }
  if (shape.type !== 'relation' && shape.id !== null) {
    diagram.removeShape(shape.id);
  }
  if (shape.type === 'relation' && shape.id !== null) {
    diagram.removeRelation(shape.id);
  }
}

const filterShape = (...types: string[]) =>
  (element: Element) => types.includes(element.parentElement?.getAttribute('data-type') || '');

const getSelectedShape = (): { id: ShapeId, type: ShapeType }
  | { id: RelationId, type: 'relation' }
  | null => {
  const { x, y } = toValue(mouse);
  const element: Element | null = document.elementsFromPoint(x, y)
    .find(filterShape('curve', 'ellipse', 'rectangle')) || null;
  const parentElement = element?.parentElement;
  if (!parentElement) {
    return null;
  }
  const dataType = parentElement.getAttribute('data-type');
  if (dataType === 'curve') {
    return {
      id: +parentElement.id as RelationId,
      type: 'relation'
    };
  } else {
    return {
      id: +parentElement.id as ShapeId,
      type: dataType as ShapeType
    }
  }
}

const styleShape = (color: Color, direction?: Direction) => {
  return () => {
    const shape = getSelectedShape();
    if (!shape || !shape.id) {
      return;
    }
    if (shape.type !== 'relation') {
      diagram.colorShape(shape.id, color)
    }
    if (shape.type === 'relation' && !!direction) {
      diagram.styleRelation(shape.id, direction);
    }
  }
};

const transientPath: Ref<string | null> = ref(null);
const connectShapes = () => {
  const fromShape = getSelectedShape();
  if (fromShape === null || fromShape.type === 'relation') {
    // no shape at mouse position found
    return;
  }

  const start = toValue(shapeStore.getPosition(fromShape.id));
  const stopWatch = watch(mouse, () => {
    const end = toValue(mouse);
    const startPosition = position(start, end);
    const endPosition = position(end, start);
    transientPath.value = path(start, startPosition, end, endPosition);
  });

  return () => {
    stopWatch();
    transientPath.value = null;
    const toShape = getSelectedShape();
    if (toShape === null || toShape.type === 'relation') {
      // no shape at mouse position found to connect to
      return;
    }
    diagram.addRelation(fromShape.id, toShape.id);
  }
}

const keyboardZoom = (zoom: 'in' | 'out') => (event: KeyboardEvent) => {
  event.preventDefault();
  const center = canvas.toCanvas({ x: windowProps.width / 2, y: windowProps.height / 2 });
  if (zoom === 'in') {
    canvas.zoomIn(center);
  } else {
    canvas.zoomOut(center);
  }
}

const svgElement: Ref<SVGSVGElement | null> = ref(null);
const { registerHook } = useHotkeys(svgElement);
// create different shapes
registerHook('e', createShape(ShapeType.Rectangle));
registerHook('q', createShape(ShapeType.Ellipse));

// remove a shape
registerHook('Delete', removeShapeOrRelation);

// change color of shape
registerHook('1', styleShape(Color.Red, Direction.Forward))
registerHook('2', styleShape(Color.Green, Direction.Backward))
registerHook('3', styleShape(Color.Blue, Direction.BothWays))
registerHook('4', styleShape(Color.Yellow, Direction.None))
registerHook('5', styleShape(Color.White))

// connect shapes
registerHook('r', connectShapes);

// hook to browser zoom
registerHook('Ctrl+=', keyboardZoom('out'));
registerHook('Ctrl+Shift++', keyboardZoom('out'));
registerHook('Ctrl+-', keyboardZoom('in'));
registerHook('Ctrl+Shift+_', keyboardZoom('in'));

const {
  position: mouse,
  registerHook: registerMouse,
  unregisterHook: unregisterMouse
} = useMouse(svgElement);
provide('mouse', mouse);

const canvas = useCanvas();

const useFade = (duration: number) => {
  const value: Ref<boolean> = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return {
    value: computed({
      get: () => {
        return value.value;
      },
      set: (newValue: boolean) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        value.value = newValue;
        timeout = setTimeout(() => {
          value.value = false;
          timeout = null;
        }, duration);
      }
    })
  };
}

const { value: fade } = useFade(2000);

const zoomCanvas = (event: WheelEvent) => {
  // zoom canvas
  if (event.deltaY > 0) {
    canvas.zoomIn(mouse.value)
  } else {
    canvas.zoomOut(mouse.value)
  }
  fade.value = true;
}

const MIN_MOVE_DISTANCE = 5;
const moveCanvas = (event: PointerEvent) => {
  let distance = 0;

  let origin = { x: event.x, y: event.y };
  const move = (moveEvent: PointerEvent) => {
    const diff = { x: moveEvent.x - origin.x, y: moveEvent.y - origin.y };
    distance = distance + Math.hypot(diff.x, diff.y);
    canvas.move(diff);
    origin = { x: moveEvent.x, y: moveEvent.y };
  }
  registerMouse('pointermove', move);
  registerMouse('pointerup', () => {
    unregisterMouse('pointermove');
  }, { once: true });
  registerMouse('pointerout', () => {
    unregisterMouse('pointermove');
  }, { once: true });
  if (event.button === 2) {
    registerMouse('contextmenu', (event: MouseEvent) => {
      if (distance > MIN_MOVE_DISTANCE) {
        event.preventDefault();
      }
    }, { once: true });
  }
}

const shapes = diagram.shapes;
const relations = diagram.relations;

onMounted(() => {
  window.addEventListener('resize', handleResize);

  // zoom & move canvas
  registerMouse('wheel', zoomCanvas, { passive: true });
  registerMouse('wheel', (event: MouseEvent) => {
    // prevent browser zoom
    event.preventDefault();
  });
  registerMouse('pointerdown', moveCanvas);
});

const focusedRelation: Ref<number> = ref(-1); 
const sorted = (relations: Relation[]) => {
  return [...relations].sort((a: Relation, b: Relation) =>
    a.id === focusedRelation.value ? 1 : b.id === focusedRelation.value ? -1 : 0)
}

const transform = computed(() => {
  const { a, b, c, d, e, f } = canvas.transformM.value;
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
})
const zoomLevel = computed(() => `${canvas.factor.value}x`)
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
        <g id="canvas" :style="{ transform }">
            <ShapeComponent
                v-for="shape of shapes"
                :key="shape.id"
                v-bind="shape"/>
            <RelationComponent
                v-for="relation of sorted(relations)"
                :key="relation.id"
                v-bind="relation"
                @focus="(id) => focusedRelation = id"/>
            <ShapeComponent
                v-if="transientShape"
                v-bind="transientShape"/>
            <path
                v-if="transientPath"
                :d="transientPath">
            </path>
        </g>
    </svg>
    <div id="zoom-level" :class="{ visible: fade }">
      <span>zoom</span><span>{{ zoomLevel }}</span>
    </div>
</template>

<style lang="postcss">
g path {
  fill: transparent;
  stroke: #222;
  stroke-width: 2;
  pointer-events: stroke;
}

#zoom-level {
  position: absolute;
  top: 8px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.25s ease-in;
}
#zoom-level.visible {
  opacity: 1;
  transition: opacity 0.5s ease-out;
}
#zoom-level span {
  margin: 4px;
}
</style>