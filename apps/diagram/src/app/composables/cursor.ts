import { computed, onMounted, reactive, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { ref as dbRef, set as dbSet, runTransaction } from 'firebase/database';
import { useDatabase, useDatabaseList, useDatabaseObject } from 'vuefire'

type CursorId = string;
type Position = { x: number, y: number };
export type Cursor = { color: string } & Position;
type Cursors = { [key: CursorId]: Cursor }

const cursorId = crypto.randomUUID();

export const useCursor = (diagramId: MaybeRefOrGetter<string | undefined>) => {
  const db = useDatabase();
  const diagramRef = computed(() => dbRef(db, `diagrams/${toValue(diagramId)}`));

  const previousDiagramId = ref<string | undefined>(undefined);

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
    const id = toValue(diagramId);
    if (!id) {
      return;
    }
    cursor.x = position.x;
    cursor.y = position.y;
    dbSet(dbRef(db, `diagrams/${id}/${cursorId}`), cursor);
  }

  const changeColor = (color: string) => {
    const id = toValue(diagramId);
    if (!id) {
      return;
    }
    cursor.color = color;
    dbSet(dbRef(db, `diagrams/${id}/${cursorId}`), cursor);
  }

  watch(() => toValue(diagramId), (id) => {
    if (id) {
      if (previousDiagramId.value) {
        removeCursor();
      }
      previousDiagramId.value = toValue(diagramId);
      addCursor();
    }
  }, { immediate: true });

  onMounted(() => {
    addEventListener('beforeunload', removeCursor);
  });

  return {
    addCursor,
    removeCursor,
    updatePosition,
    changeColor,
    cursor: computed(() => useDatabaseObject<Cursor>(dbRef(
      db, `diagrams/${toValue(diagramId)}/${cursorId}`)).value),
    others: computed(() => useDatabaseList<Cursor>(dbRef(
      db, `diagrams/${toValue(diagramId)}`)).value.filter(({ id }) => id !== cursorId))
  }
}