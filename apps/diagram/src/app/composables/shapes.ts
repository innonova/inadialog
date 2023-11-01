import { computed } from 'vue';
import type { Ref, UnwrapNestedRefs } from 'vue';
import type { ShapeId, ShapeType } from './model/shape';
import type { Point } from './curve';

type Side = 'left' | 'right' | 'top' | 'bottom';
type Shape = {
  position: Ref<Point>
  size: UnwrapNestedRefs<{ height: number, width: number }>
  dockingPoints?: { [key in Side]: Ref<Point> }
  type: ShapeType
};

const distance = (p: Point, q: Point): number => Math.hypot(q.x - p.x, q.y - p.y);

export function useShapes() {
  const shapes: { [ id: number ]: Shape } = {}

  const register = (
    id: ShapeId,
    position: Ref<Point>,
    size: UnwrapNestedRefs<{ height: number, width: number }>,
    type: ShapeType
  ) => {
    shapes[id] = {
      position,
      size,
      type
    };
  }

  const unregister = (id: ShapeId) => {
    delete shapes[id];
  }

  const getPosition = (id: ShapeId): Ref<Point> => {
    return shapes[id].position;
  }

  const getNearestDockingPoint = (id: ShapeId, point: Point): Ref<Point> | null => {
    let sides = shapes[id].dockingPoints;
    if (!sides) {
      const position = shapes[id].position;
      if (!position) {
        return null;
      }
      const size = shapes[id].size;
      if (!size) {
        return null;
      }
      sides = sidesFor(shapes[id])
      shapes[id].dockingPoints = sides;
    }
    let shortestDistance: number | null = null;
    let nearestSide: Side = 'left';
    for (const side in sides) {
      const dist = distance(sides[side as Side].value, point);
      if (shortestDistance === null || dist < shortestDistance) {
        shortestDistance = dist;
        nearestSide = side as Side;
      }
    }
    return sides[nearestSide];
  }

  const sidesFor = (shape: Shape): { [key in Side]: Ref<{ x: number, y: number }>} => {
    switch (shape.type) {
    case 'ellipse':
      return {
        left: computed(() => ({
          x: shape.position.value.x - shape.size.width / 2 * Math.SQRT2,
          y: shape.position.value.y
        })),
        right: computed(() => ({
          x: shape.position.value.x + shape.size.width / 2 * Math.SQRT2,
          y: shape.position.value.y
        })),
        top: computed(() => ({
          x: shape.position.value.x,
          y: shape.position.value.y - shape.size.height / 2 * Math.SQRT2
        })),
        bottom: computed(() => ({
          x: shape.position.value.x,
          y: shape.position.value.y + shape.size.height / 2 * Math.SQRT2
        }))
      }
    case 'rectangle':
    default:
      return {
        left: computed(() => ({
          x: shape.position.value.x - shape.size.width / 2,
          y: shape.position.value.y
        })),
        right: computed(() => ({
          x: shape.position.value.x + shape.size.width / 2,
          y: shape.position.value.y
        })),
        top: computed(() => ({
          x: shape.position.value.x,
          y: shape.position.value.y - shape.size.height / 2
        })),
        bottom: computed(() => ({
          x: shape.position.value.x,
          y: shape.position.value.y + shape.size.height / 2
        })),
      }
    }
  };

  return {
    register,
    unregister,
    getPosition,
    getNearestDockingPoint
  }
}