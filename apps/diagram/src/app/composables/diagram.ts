import { addDoc, doc, setDoc } from 'firebase/firestore';
import { Color, Shape, ShapeId, ShapeType } from './model/shape';
import { useFirestore, useDocument } from 'vuefire';
import { ArrowStyle, Relation, RelationId } from './model/relation';
import { v4 as uuid } from 'uuid';
import { Ref } from 'vue';

export interface Diagram {
  id: string;
  shapes: Shape[];
  relations: Relation[];
}

export const createDiagram = async (id: string) => {
  const db = useFirestore();
  await setDoc(doc(db, 'diagrams', id), { id, shapes: [], relations: [] });
};

export const useDiagram = (id: string) => {
  const db = useFirestore();
  const diagram = useDocument<Diagram>(doc(db, 'diagrams', id));
  return diagram;
};

export const addShape = (diagram: Diagram) => {
  const db = useFirestore();
  const maxId = Math.max(...diagram.shapes.map((item) => item.id));
  const id = maxId > 0 ? maxId + 1 : 1;

  diagram.shapes.push({
    id: id as ShapeId,
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
  const id = maxId > 0 ? maxId + 1 : 1;

  diagram.relations.push({
    id: id as RelationId,
    from: {
      id: from,
      x: 0,
      y: 0,
      style: ArrowStyle.None,
      text: '',
    },
    to: {
      id: to,
      x: 0,
      y: 0,
      style: ArrowStyle.None,
      text: '',
    },
    text: '',
  });

  setDoc(doc(db, 'diagrams', diagram.id), diagram);
};

export const removeShape = (diagram: Diagram, id: ShapeId) => {
  const db = useFirestore();
  const index = diagram.shapes.findIndex((item) => item.id === id);
  if (index >= 0) {
    const relations = diagram.relations.filter(
      (item) => item.from.id === id || item.to.id === id
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

export const setShapeText = (diagram: Diagram, id: ShapeId, text: string) => {
  const db = useFirestore();
  const shape = diagram.shapes.find((item) => item.id === id);
  if (shape) {
    shape.text = text;
    setDoc(doc(db, 'diagrams', diagram.id), diagram);
  }
};
