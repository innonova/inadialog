import { ShapeId } from './shape';

export type RelationId = number & { __type: 'RelationId' };

type AssertRelationId = (value: number) => asserts value is RelationId;

export const isValidRelationId = (value: number): boolean => {
  return Number.isFinite(value);
};

export const assertRelationId: AssertRelationId = (
  value: number
): asserts value is RelationId => {
  if (!isValidRelationId(value)) {
    throw new Error('Value must be a finite number');
  }
};

export enum ArrowStyle {
  None = 'none',
}

export interface Relation {
  id: RelationId;
  from: {
    id: ShapeId,
    x: number,
    y: number,
    style: ArrowStyle,
    text: string
  },
  to: {
    id: ShapeId,
    x: number,
    y: number,
    style: ArrowStyle,
    text: string

  },
  text: string
}
