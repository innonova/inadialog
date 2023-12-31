import { doc, setDoc } from 'firebase/firestore';
import { computed, toValue } from 'vue';
import type { Ref } from 'vue';
import { useFirestore, useDocument } from 'vuefire';

import { ArrowStyle, Direction, Relation, RelationId } from './model/relation';
import { Color, Shape, ShapeId, ShapeType } from './model/shape';
import { getAuth } from 'firebase/auth';

type HasId = {
  id: number
}
const findMaxId = (objects: HasId[]) => {
  const maxId = Math.max(...(objects.map((item) => item.id)) || []);
  return maxId > 0 ? maxId + 1 : 1;
}

export type Visibility = 'private' | 'public';

export interface Diagram {
  author_id: string;
  id: string;
  shapes: Shape[];
  relations: Relation[];
  visibility: Visibility
}

export const createDiagram = async (id: string = crypto.randomUUID()): Promise<string> => {
  const db = useFirestore();
  const auth = getAuth();
  await setDoc(doc(db, 'diagrams', id), {
    author_id: auth.currentUser?.uid,
    id, shapes: [],
    relations: [],
    visibility: 'public'
  });
  return id;
};

export const useDiagram = (diagramId: Ref<string>) => {

  const addShape = (type: ShapeType, x: number, y: number, color: Color = Color.White) => {
    const id = findMaxId(diagram.value ? diagram.value.shapes : []);

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

    setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
  };

  const addRelation = (from: ShapeId, to: ShapeId) => {
    const id = findMaxId(diagram.value ? diagram.value.relations : []);

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

    setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
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
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  };

  const removeRelation = (id: RelationId) => {
    const index = diagram.value?.relations.findIndex((item) => item.id === id);
    if (index !== undefined && index >= 0) {
      diagram.value?.relations.splice(index, 1);
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
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
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
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
    setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
  };

  const colorShape = (id: ShapeId, color: Color) => {
    const shape = diagram.value?.shapes.find((item) => item.id === id);
    if (shape) {
      shape.color = color;
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  };

  const setStyles = (relation: Relation, fromStyle: ArrowStyle, toStyle: ArrowStyle) => {
    relation.from.style = fromStyle;
    relation.to.style = toStyle;
  }

  const styleRelation = (id: RelationId, direction: Direction) => {
    const relation = diagram.value?.relations.find((item) => item.id === id);
    if (relation) {
      switch (direction) {
      case Direction.Forward:
        setStyles(relation, ArrowStyle.None, ArrowStyle.Simple);
        break;
      case Direction.Backward:
        setStyles(relation, ArrowStyle.Simple, ArrowStyle.None);
        break;
      case Direction.BothWays:
        setStyles(relation, ArrowStyle.Simple, ArrowStyle.Simple);
        break;
      case Direction.None:
        setStyles(relation, ArrowStyle.None, ArrowStyle.None);
      }
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  }

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
    setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
  }

  const setShapeText = (id: ShapeId, text: string) => {
    const shape = diagram.value?.shapes.find((item) => item.id === id);
    if (shape) {
      shape.text = text;
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  };

  const setLabelText = (
    relationId: RelationId,
    text: string,
    position: 'start' | 'middle' | 'end'
  ) => {
    const relation = diagram.value?.relations.find((item) => item.id === relationId);
    if (relation) {
      switch (position) {
      case 'start':
        relation.from.text = text;
        break;
      case 'middle':
        relation.text = text;
        break;
      case 'end':
        relation.to.text = text;
        break;
      }
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  };

  const clear = () => {
    if (diagram.value) {
      diagram.value.relations = [];
      diagram.value.shapes = [];
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  }

  const changeVisibility = (visibility: 'private' | 'public') => {
    if (diagram.value) {
      diagram.value.visibility = visibility;
      setDoc(doc(db, 'diagrams', toValue(diagramId)), diagram.value);
    }
  }

  const db = useFirestore();
  const diagram = useDocument<Diagram>(computed(() => doc(db, 'diagrams', toValue(diagramId))));

  return {
    diagram: computed(() => diagram.value),
    shapes: computed(() => diagram.value?.shapes || []),
    relations: computed(() => diagram.value?.relations || []),
    visibility: computed(() => diagram.value?.visibility || 'public'),
    addShape,
    removeShape,
    addRelation,
    removeRelation,
    moveShape,
    connect,
    colorShape,
    styleRelation,
    setShapeText,
    setLabelText,
    clear,
    changeVisibility
  }
};

export type UseDiagram = ReturnType<typeof useDiagram>