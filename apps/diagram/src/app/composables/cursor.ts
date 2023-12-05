import { computed, reactive } from 'vue';
import type { Ref } from 'vue';

import { ref as dbRef, set as dbSet, runTransaction } from 'firebase/database';
import { useDatabase, useDatabaseList, useDatabaseObject } from 'vuefire'

type CursorId = string;
type Position = { x: number, y: number };
type Cursor = { color: string } & Position;
type Cursors = { [key: CursorId]: Cursor }

const cursorId = crypto.randomUUID();

export const useCursor = (diagramId: Ref<string>) => {
  const db = useDatabase();
  const diagramRef = computed(() => dbRef(db, `diagrams/${diagramId.value}`));

  let init = false;
  const cursor = reactive<Cursor>({
    color: 'blue',
    x: 0,
    y: 0
  });

  const addCursor = async () => {
    if (init) {
      // don't add the cursor twice, first remove the old one
      return;
    }
    try {
      await runTransaction(diagramRef.value, (currentData) => {
        let data = currentData;
        if (!data) {
          data = {};
        }
        data[cursorId] = cursor;
        return data;
      });
    } catch (error) {
      console.log('addCursor failed: ', error);
    }
    init = true;
  }

  const removeCursor = async () => {
    try {
      await runTransaction(diagramRef.value, (currentData: Cursors) => {
        delete currentData[cursorId];
        return currentData;
      });
    } catch (error) {
      console.log('removeCursor failed: ', error);
    }
  }

  const updatePosition = (position: Position) => {
    cursor.x = position.x;
    cursor.y = position.y;
    dbSet(dbRef(db, `diagrams/${diagramId.value}/${cursorId}`), cursor);
  }

  const changeColor = (color: string) => {
    cursor.color = color;
    dbSet(dbRef(db, `diagrams/${diagramId.value}/${cursorId}`), cursor);
  }

  return {
    addCursor,
    removeCursor,
    updatePosition,
    changeColor,
    cursor: computed(() => useDatabaseObject<Cursor>(dbRef(
      db, `diagrams/${diagramId.value}/${cursorId}`)).value),
    others: computed(() => useDatabaseList<Cursor>(dbRef(
      db, `diagrams/${diagramId.value}`)).value)
  }
}