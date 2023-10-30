import type { Ref } from 'vue';
import type { ShapeId } from './model/shape';

export function useShapes() {
  const positions: { [ id: string ]: Ref<{ x: number, y: number }> } = {};

  const register = (id: ShapeId, position: Ref<{ x: number, y: number }>) => {
    positions[id.toString()] = position;
  }

  const unregister = (id: ShapeId) => {
    delete positions[id.toString()];
  }

  const getPosition = (id: ShapeId): Ref<{ x: number, y: number }> => {
    return positions[id.toString()];
  }

  return {
    register,
    unregister,
    getPosition
  }
}