import { doc, setDoc } from 'firebase/firestore';
import { Color, Shape, ShapeId, ShapeType } from './model/shape';
import { useFirestore, useDocument } from 'vuefire';
import { Relation, RelationId } from './model/relation';

export interface Diagram {
  id: string;
  shapes: Shape[];
  relations: Relation[];
}

export const useDiagram = (id: string) => {
  const db = useFirestore();
  const diagram = useDocument<Diagram>(doc(db, 'diagrams', id));
  return diagram;
};

export const addShape = (diagram: Diagram) => {
  const db = useFirestore();
  const maxId = Math.max(...diagram.shapes.map((item) => item.id));

  diagram.shapes.push({
    id: (maxId + 1) as ShapeId,
    type: ShapeType.Rectangle,
    color: Color.White,
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    text: '',
    fontSize: 10,
  });

  setDoc(doc(db, 'diagrams', diagram.id), diagram);
};

export const addRelation = (diagram: Diagram, from: ShapeId, to: ShapeId) => {
  const db = useFirestore();
  const maxId = Math.max(...diagram.relations.map((item) => item.id));

  diagram.relations.push({
    id: (maxId + 1) as RelationId,
    from,
    to,
  });

  setDoc(doc(db, 'diagrams', diagram.id), diagram);
};

export const removeShape = (diagram: Diagram, id: ShapeId) => {
  const db = useFirestore();
  const index = diagram.shapes.findIndex((item) => item.id === id);
  if (index >= 0) {
    const relations = diagram.relations.filter(
      (item) => item.from === id || item.to === id
    );
    relations.forEach((rel) => {
      const relIndex = diagram.relations.findIndex(
        (item) => item.id === rel.id
      );
      diagram.relations.splice(relIndex, 1);
    });
    diagram.shapes.splice(index, 1);
    setDoc(doc(db, 'diagrams', diagram.id), diagram);
  }
};

export const removeRelation = (diagram: Diagram, id: RelationId) => {
  const db = useFirestore();
  const index = diagram.relations.findIndex((item) => item.id === id);
  if (index >= 0) {
    diagram.relations.splice(index, 1);
    setDoc(doc(db, 'diagrams', diagram.id), diagram);
  }
};

export const moveShape = (
  diagram: Diagram,
  id: ShapeId,
  x: number,
  y: number
) => {
  const db = useFirestore();
  const shape = diagram.shapes.find((item) => item.id === id);
  if (shape) {
    shape.x = x;
    shape.y = y;
    setDoc(doc(db, 'diagrams', diagram.id), diagram);
  }
};

export const colorShape = (diagram: Diagram, id: ShapeId, color: Color) => {
  const db = useFirestore();
  const shape = diagram.shapes.find((item) => item.id === id);
  if (shape) {
    shape.color = color;
    setDoc(doc(db, 'diagrams', diagram.id), diagram);
  }
};
