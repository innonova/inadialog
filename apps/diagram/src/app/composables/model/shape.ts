export type ShapeId = number & { __type: 'ShapeId' };

type AssertShapeId = (value: number) => asserts value is ShapeId;

export const isValidShapeId = (value: number): boolean => {
  return Number.isFinite(value);
};

export const assertShapeId: AssertShapeId = (
  value: number
): asserts value is ShapeId => {
  if (!isValidShapeId(value)) {
    throw new Error('Value must be a finite number');
  }
};

export enum Color {
  Blue = 'blue',
  Red = 'red',
  Yellow = 'yellow',
  Green = 'green',
  White = 'white',
}

export enum ShapeType {
  Rectangle = 'rectange',
  Oval = 'oval',
}

export interface Shape {
  id: ShapeId;
  type: ShapeType;
  color: Color;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
}
