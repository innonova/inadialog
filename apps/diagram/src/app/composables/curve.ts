export type Point = {
  x: number,
  y: number
}

type Position = 'right' | 'left' | 'top' | 'bottom';

const add = (p: Point, q: Point): Point => ({
  x: p.x + q.x,
  y: p.y + q.y
})

const sub = (p: Point, q: Point): Point => ({
  x: p.x - q.x,
  y: p.y - q.y
})

const position = (start: Point, end: Point): Position => {
  return 'right';
}

const p = (point: Point): string => `${point.x + ', ' + point.y}`

const controlPoint = (start: Point, end: Point) => {
  const diff = sub(end, start);

  const len = Math.hypot(diff.x, diff.y);
  if (len <= 0) {
    return start;
  }
  const factor = (diff.x * diff.y) / (2 * len);
  //const factor = Math.abs(len / (diff.x + diff.y)) * 50;

  const p1: Point = { x: diff.x / 3, y: diff.y / 3 };

  let norm: Point;
  switch (position(start, end)) {
  case 'right': {
    const s = Math.sign(diff.x);
    norm = { x: (2 * s * diff.y) / len, y: (-s * diff.x) / len };
    break;
  }
  case 'left': {
    const s = -Math.sign(diff.x);
    norm = { x: (2 * s * diff.y) / len, y: (-s * diff.x) / len };
    break;
  }
  case 'top': {
    const s = -Math.sign(diff.y);
    norm = { x: (-s * diff.y) / len, y: (2 * s * diff.x) / len };
    break;
  }
  case 'bottom': {
    const s = Math.sign(diff.y);
    norm = { x: (-s * diff.y) / len, y: (2 * s * diff.x) / len };
    break;
  }
  }
  return add(start, add(p1, { x: norm.x * factor, y: norm.y * factor }));
}
export const path = (start: Point, end: Point): string => {
  const cpStart = controlPoint(start, end);
  const cpEnd = controlPoint(end, start); 
  return `M ${p(start)} C ${p(cpStart)}, ${p(cpEnd)}, ${p(end)}`;
};
