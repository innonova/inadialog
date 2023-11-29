<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, reactive, toValue, watch } from 'vue';
import type { Ref, UnwrapNestedRefs } from 'vue';

import { Color, ShapeId, ShapeType } from '../../composables/model/shape';
import { useMovement } from '../../composables/svg-element';
import ResizeComponent from './ResizeComponent.vue';
import type { Corner } from './ResizeComponent.vue';
import TextElement from './TextElement.vue';
import { Point } from '../../composables/curve';

const props = defineProps<{
  id: ShapeId,
  type: ShapeType,
  x: number,
  y: number,
  height: number,
  width: number,
  text: string,
  color: Color
}>();

interface Diagram {
  moveShape(id: ShapeId, x: number, y: number, height: number, width: number): void
  setShapeText(shapeId: ShapeId, text: string ): void
}
interface Shapes {
  register(
    id: ShapeId,
    position: Ref<{ x: number, y: number }>,
    size: UnwrapNestedRefs<{ height: number, width: number }>,
    type: ShapeType
  ): void
  unregister(id: ShapeId): void
}
const diagram = inject<Diagram>('diagram');
const shapes = inject<Shapes>('shapes');

const groupRef = ref<SVGGElement | null>(null);
const position = ref<Point>({ x: props.x, y: props.y });
useMovement(groupRef, () => ({ x: props.x, y: props.y }), (diff) => {
  moved.value = true;
  position.value.x = position.value.x + diff.x;
  position.value.y = position.value.y + diff.y;
});
watch([() => props.x, () => props.y], () => {
  position.value.x = props.x;
  position.value.y = props.y;
})
const moved: Ref<boolean> = ref(false);

const size = reactive({ height: props.height, width: props.width });
watch(() => ({ height: props.height, width: props.width }), (value) => {
  size.height = value.height;
  size.width = value.width;
});

const textElement: Ref<InstanceType<typeof TextElement> | null> = ref(null);
const resize = (corner: Corner, diff: { x: number, y: number }) => {
  if (textElement.value) {
    const newDiff = { x: 0, y: 0 };
    const { width, height } = toValue(textElement.value);
    if (size.width + diff.x > width + 16) {
      size.width = size.width + diff.x;
      newDiff.x = diff.x;
      moved.value = true;
    }
    if (size.height + diff.y > height + 9) {
      size.height = size.height + diff.y;
      newDiff.y = diff.y;
      moved.value = true;
    }
    switch (corner) {
    case 'ne':
      position.value.x = position.value.x + newDiff.x / 2;
      position.value.y = position.value.y - newDiff.y / 2;
      break;
    case 'se':
      position.value.x = position.value.x + newDiff.x / 2;
      position.value.y = position.value.y + newDiff.y / 2;
      break;
    case 'sw':
      position.value.x = position.value.x - newDiff.x / 2;
      position.value.y = position.value.y + newDiff.y / 2;
      break;
    case 'nw':
      position.value.x = position.value.x - newDiff.x / 2;
      position.value.y = position.value.y - newDiff.y / 2;
      break;
    }
  }
};

const handlePointerup = () => {
  if (moved.value) {
    diagram?.moveShape(props.id, position.value.x, position.value.y, size.height, size.width);
    moved.value = false;
  } else {
    toggle();
  }
};

const handleTextchange = () => {
  if (textElement.value) {
    const { width, height } = toValue(textElement.value);
    if (width + 16 > size.width) {
      size.width = width + 16;
      moved.value = true;
    }
    if (height + 9 > size.height) {
      size.height = height + 9;
      moved.value = true;
    }
  }
}

const handleTextblur = (text: string) => {
  diagram?.setShapeText(props.id, text);
  if (moved.value) {
    diagram?.moveShape(props.id, position.value.x, position.value.y, size.height, size.width);
  }
  toggle();
}

onMounted(() => {
  shapes?.register(props.id, position, size, props.type);
});

onUnmounted(() => {
  shapes?.unregister(props.id);
});

const useState = () => {
  const states = ['idle', 'edit'] as const;
  const state: Ref<number> = ref(0);

  const toggle = () => {
    state.value = (state.value + 1) % states.length;
  };

  return {
    state: computed(() => states[state.value]),
    toggle
  };
};

const { state, toggle } = useState();
</script>

<template>
    <g
        :id="$props.id.toString()"
        ref="groupRef"
        :class="$props.color"
        :data-type="$props.type"
        :transform="`translate(${position.x} ${position.y})`"
        @pointerup="handlePointerup">
        <rect
            v-if="$props.type === ShapeType.Rectangle"
            rx="15"
            :x="-size.width / 2"
            :y="-size.height / 2"
            :width="size.width"
            :height="size.height">
        </rect>
        <ellipse
            v-if="$props.type === ShapeType.Ellipse"
            :rx="size.width * Math.SQRT1_2"
            :ry="size.height * Math.SQRT1_2">
        </ellipse>
        <TextElement
          ref="textElement"
          :value="$props.text"
          :edit="state === 'edit'"
          @textchange="handleTextchange"
          @textblur="handleTextblur"/>
        <ResizeComponent
          :height="size.height"
          :width="size.width"
          @resize="resize"/>
    </g>
</template>

<style lang="postcss" scoped>
g.red rect, g.red ellipse {
    fill: #ffe6ea;
    stroke: #ffbfc7;
}
g.red:hover rect, g.red:hover ellipse {
  filter: drop-shadow(3px 3px 6px #de1d33);
}
g.green rect, g.green ellipse {
    fill: #ebffe6;
    stroke: #c9ffbf;
}
g.green:hover rect, g.green:hover ellipse {
  filter: drop-shadow(3px 3px 6px #3ade1d);
}
g.blue rect, g.blue ellipse {
    fill: #e6f4ff;
    stroke: #bee0ff;
}
g.blue:hover rect, g.blue:hover ellipse {
  filter: drop-shadow(3px 3px 6px #1d81de);
}
g.yellow rect, g.yellow ellipse {
    fill: #fff7e6;
    stroke: #ffeebf;
}
g.yellow:hover rect, g.yellow:hover ellipse {
  filter: drop-shadow(3px 3px 6px #deaa1d);
}
g.white rect, g.white ellipse {
    fill: white;
    stroke: #222;
}
g.white:hover rect, g.white:hover ellipse {
  filter: drop-shadow(3px 3px 6px #222);
}
g circle.resize-ne {
  cursor: ne-resize;
}
g circle.resize-se {
  cursor: se-resize;
}
g circle.resize-sw {
  cursor: sw-resize;
}
</style>