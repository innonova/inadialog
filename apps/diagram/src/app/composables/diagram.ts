import { doc, setDoc } from 'firebase/firestore';
import { computed } from 'vue';
import { useFirestore, useDocument } from 'vuefire';

import { ArrowStyle, Relation, RelationId } from './model/relation';
import { Color, Shape, ShapeId, ShapeType } from './model/shape';

export interface Diagram {
  id: string;
  shapes: Shape[];
  relations: Relation[];
}

export const createDiagram = async (id: string) => {
  const db = useFirestore();
  await setDoc(doc(db, 'diagrams', id), { id, shapes: [], relations: [] });
};

export const useDiagram = (diagramId: string) => {

  const addShape = (type: ShapeType, x: number, y: number, color: Color = Color.White) => {
    const maxId = Math.max(...(diagram.value?.shapes.map((item) => item.id)) || []);
    const id = maxId > 0 ? maxId + 1 : 1;

    diagram.value?.shapes.push({
      id: id as ShapeId,
      type,
      color,
      x,
      y,
      width: 100,
      height: 100,
      text: '',
      fontSize: 10,
    });

    setDoc(doc(db, 'diagrams', diagramId), diagram.value);
  };

  const addRelation = (from: ShapeId, to: ShapeId) => {
    const maxId = Math.max(...(diagram.value?.relations.map((item) => item.id) || []));
    const id = maxId > 0 ? maxId + 1 : 1;

    const fromShape = diagram.value?.shapes
      .find((shape) => shape.id === from) || { x: 0, y: 0 };
    const toShape = diagram.value?.shapes
      .find((shape) => shape.id === to) || { x: 0, y: 0 };

    diagram.value?.relations.push({
      id: id as RelationId,
      from: {
        id: from,
        x: fromShape.x,
        y: fromShape.y,
        style: ArrowStyle.None,
        text: '',
      },
      to: {
        id: to,
        x: toShape.x,
        y: toShape.y,
        style: ArrowStyle.None,
        text: '',
      },
      text: '',
    });

    setDoc(doc(db, 'diagrams', diagramId), diagram.value);
  };

  const removeShape = (id: ShapeId) => {
    const index = diagram.value?.shapes.findIndex((item) => item.id === id);
    if (index !== undefined && index >= 0) {
      const relations = diagram.value?.relations.filter(
        (item) => item.from.id === id || item.to.id === id
      ) || [];
      relations.forEach((rel) => {
        const relIndex = diagram.value?.relations.findIndex(
          (item) => item.id === rel.id
        );
        if (relIndex !== undefined && relIndex >= 0) {
          diagram.value?.relations.splice(relIndex, 1);
        }
      });
      diagram.value?.shapes.splice(index, 1);
      setDoc(doc(db, 'diagrams', diagramId), diagram.value);
    }
  };

  const removeRelation = (id: RelationId) => {
    const index = diagram.value?.relations.findIndex((item) => item.id === id);
    if (index !== undefined && index >= 0) {
      diagram.value?.relations.splice(index, 1);
      setDoc(doc(db, 'diagrams', diagramId), diagram.value);
    }
  };

  const moveShape = (
    id: ShapeId,
    x: number,
    y: number,
    height: number,
    width: number
  ) => {
    const shape = diagram.value?.shapes.find((item) => item.id === id);
    if (shape) {
      shape.x = x;
      shape.y = y;
      shape.height = height ?? shape.height;
      shape.width = width ?? shape.width
      setDoc(doc(db, 'diagrams', diagramId), diagram.value);
    }
    // update connected relations
    diagram.value?.relations
      .forEach((relation) => {
        if (relation.from.id === id) {
          relation.from.x = x;
          relation.from.y = y;
        }
        if (relation.to.id === id) {
          relation.to.x = x;
          relation.to.y = y;
        }});
    setDoc(doc(db, 'diagrams', diagramId), diagram.value);
  };

  const colorShape = (id: ShapeId, color: Color) => {
    const shape = diagram.value?.shapes.find((item) => item.id === id);
    if (shape) {
      shape.color = color;
      setDoc(doc(db, 'diagrams', diagramId), diagram.value);
    }
  };

  const connect = (id: RelationId, shapeId: ShapeId, type: 'start' | 'end') => {
    const shape = diagram.value?.shapes.find((item) => item.id === shapeId);
    const relation = diagram.value?.relations.find((item) => item.id === id);
    if (!shape || !relation) {
      return;
    }

    if (type === 'start') {
      relation.from.id = shapeId;
      relation.from.x = shape.x;
      relation.from.y = shape.y;
    } else {
      relation.to.id = shapeId;
      relation.to.x = shape.x;
      relation.to.y = shape.y;
    }
    setDoc(doc(db, 'diagrams', diagramId), diagram.value);
  }

  const setShapeText = (id: ShapeId, text: string) => {
    const shape = diagram.value?.shapes.find((item) => item.id === id);
    if (shape) {
      shape.text = text;
      setDoc(doc(db, 'diagrams', diagramId), diagram.value);
    }
  };

  const db = useFirestore();
  const diagram = useDocument<Diagram>(computed(() => doc(db, 'diagrams', diagramId)));

  return {
    diagram: computed(() => diagram.value),
    shapes: computed(() => diagram.value?.shapes || []),
    relations: computed(() => diagram.value?.relations || []),
    addShape,
    removeShape,
    addRelation,
    removeRelation,
    moveShape,
    connect,
    colorShape,
    setShapeText
  }
};