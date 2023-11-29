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

export enum Direction { 
  None = 'none',
  Forward = 'forward',
  Backward = 'backward',
  BothWays = 'both_ways'
}
export enum ArrowStyle {
  None = 'none',
  Simple = 'simple'
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
