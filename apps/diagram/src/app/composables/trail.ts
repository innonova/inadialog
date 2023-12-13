import { computed, ref, toValue } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';
import { useDatabase, useDatabaseList } from 'vuefire';
import {
  orderByChild,
  push,
  query,
  ref as dbRef,
  remove as dbRemove,
  update as dbUpdate,
} from 'firebase/database';

import { Point } from './curve';
import { cursorId } from './cursor';

export const useTrail = (start: Point) => {
  const bufferSize = 8;
  const buffer: Point[] = [];

  let path = `M ${start.x} ${start.y} `;

  const append = (point: Point) => {
    buffer.push(point);
    while (buffer.length > bufferSize) {
      buffer.shift();
    }
  }

  const getAveragePoint = (points: Point[]): Point => {
    const len = points.length;
    const sum = points.reduceRight((acc, current) =>
      ({ x: acc.x + current.x, y: acc.y + current.y}))
    return {
      x: sum.x / len,
      y: sum.y / len
    }
  }

  const L = (point: Point) => `L ${point.x} ${point.y} `;

  const updateSvgPath = () => {
    const point = getAveragePoint(buffer);
    if (point) {
      path += L(point);

      let tmpPath = '';
      const length = buffer.length;
      if (length % 2 === 1 || length >= bufferSize) {
        for (let offset = 2; offset < buffer.length; offset += 2) {
          tmpPath += L(getAveragePoint(buffer.slice(offset)));
        }
      }

      return path + tmpPath;
    }
    return '';
  }

  return {
    appendPoint: (point: Point): string => {
      append(point);
      return updateSvgPath();
    }
  }
}

const trailId = cursorId;

type Cursor = {
  cursor: string,
  d: string,
  color: string,
  fade: number
}

export const useRemoteTrail = (diagramId: MaybeRefOrGetter<string | undefined>) => {
  const db = useDatabase();
  const trailKey = ref<string | null>(null);

  const path = ref<string>('');

  const addPart = (part: string) => {
    const id = toValue(diagramId);
    if (!trailKey.value) {
      trailKey.value = push(dbRef(db, `trails/${id}`)).key;
      const updates: { [key: string]: string} = {};
      updates[`trails/${id}/${trailKey.value}/cursor`] = trailId;
      updates[`trails/${id}/${trailKey.value}/d`] = '';
      updates[`trails/${id}/${trailKey.value}/color`] = 'blue';
      dbUpdate(dbRef(db), updates);
    }

    path.value = part;

    dbUpdate(dbRef(db, `trails/${id}/${trailKey.value}`), { d: path.value });
  };

  const startFade = (trailId: Ref<string | null>) => {
    const trailDbRef = dbRef(db, `trails/${toValue(diagramId)}/${trailId.value}`);
    let fade = 1;
    const intervalId = setInterval(() => {
      if (fade <= 0) {
        clearInterval(intervalId);
        dbRemove(trailDbRef);
        return;
      }
      dbUpdate(trailDbRef, { fade });
      fade = fade - 0.1;
    }, 1000);
  };

  addEventListener('onbeforeunload', () => {
    console.log('remove remaining trails');
  });

  const commit = () => {
    startFade(trailKey);
    path.value = '';
    trailKey.value = null;
  };

  return {
    addPart,
    commit,
    trails: computed(() => {
      const id = toValue(diagramId);
      const q = query(
        dbRef(db, `trails/${id}`),
        orderByChild('cursor'),
      );
      return useDatabaseList<Cursor>(() => q).value
        .filter(({ cursor }) => cursor !== trailId);
    })
  }
}

export type UseRemoteTrail = ReturnType<typeof useRemoteTrail>