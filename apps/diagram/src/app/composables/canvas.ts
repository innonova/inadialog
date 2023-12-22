import { computed, ref } from 'vue';
import type { Ref } from 'vue';

import { Point } from './curve';

const minFactor = 0.5;
const maxFactor = 10;

const factor = ref(1);
const transformM: Ref<DOMMatrix> = ref(new DOMMatrix());

const setTransformM = ([a, b, c, d, e, f]: [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
]) => {
  transformM.value = new DOMMatrix([a, b, c, d, e, f]);
  factor.value = 1 / a;
};

// translate screen coordinates to canvas coordinates
const toCanvas = (position: Point): Point => {
  const point = new DOMPoint(position.x, position.y);
  const translationMatrix = transformM.value.inverse();
  const svgPoint = point.matrixTransform(translationMatrix);
  return {
    x: svgPoint.x,
    y: svgPoint.y
  };
}

const toScreen = (position: Point): Point => {
  const point = new DOMPoint(position.x, position.y);
  const screenPoint = point.matrixTransform(transformM.value);
  return {
    x: screenPoint.x,
    y: screenPoint.y
  }
}

// Move canvas
const move = (diff: Point) => {
  transformM.value = transformM.value.translate(diff.x * factor.value, diff.y * factor.value);
};

// Zoom in and out of canvas
const zoom = (offset: Point, nextStep: number) => {
  const nextFactor = factor.value * nextStep;
  if (nextFactor < minFactor || maxFactor < +nextFactor.toFixed(1)) {
    return;
  }
  const scale = factor.value / (factor.value * nextStep);
  transformM.value = new DOMMatrix()
    .translate(offset.x, offset.y)
    .scale(scale, scale)
    .translate(-offset.x, -offset.y)
    .multiply(transformM.value);
  factor.value = nextFactor;
};
const zoomIn = (offset: Point) => zoom(offset, 5 / 4);
const zoomOut = (offset: Point) => zoom(offset, 4 / 5);

export const useCanvas = () => {
  return {
    transformM: computed(() => transformM.value),
    setTransformM,
    factor: computed(() => factor.value),
    toCanvas,
    toScreen,
    move,
    zoomIn,
    zoomOut
  };
};
