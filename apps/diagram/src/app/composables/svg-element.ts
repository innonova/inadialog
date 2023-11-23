import {
  computed,
  onMounted,
  onScopeDispose,
  onUnmounted,
  ref,
  toValue,
  unref,
  watch
} from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

type ObserverSize = {
    readonly inlineSize: number
    readonly blockSize: number
}
type ObserverEntry = {
    readonly target: Element
    readonly contentRect: DOMRectReadOnly
    readonly borderBoxSize: ReadonlyArray<ObserverSize>
    readonly contentBoxSize: ReadonlyArray<ObserverSize>
    readonly devicePixelContentBoxSize: ReadonlyArray<ObserverSize>
}

type Callback = (entries: ReadonlyArray<ObserverEntry>, observer: ResizeObserver) => void;

type ObserverBoxOptions = 'border-box' | 'content-box' | 'device-pixel-content-c box'
type ObserverOptions = {
    box?: ObserverBoxOptions
}

declare class ResizeObserver {
  constructor(callback: Callback)
  disconnect(): void
  observe(target: Element, options?: ObserverOptions): void
  unobserve(target: Element): void
}

export function useElementSize(elementRef: Ref<SVGElement | null>) {
  const height = ref(0);
  const width = ref(0);

  let observer: ResizeObserver | null = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  });

  const stopWatch = watch(
    computed(() => unref(elementRef)),
    (element) => {
      if (element) {
        observer?.observe(element);
      }
    }, { immediate: true, flush: 'post', deep: true });

  const cleanUp = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
  onScopeDispose(() => {
    cleanUp();
    stopWatch();
  });

  return {
    height,
    width
  }
}

export function useMovement(
  elementRef: Ref<SVGGElement | null>,
  initialPosition: MaybeRefOrGetter<{ x: number, y: number}>
) {
  const position = ref(toValue(initialPosition));
  const movement = ref<{ x: number, y: number }>({ x: 0, y: 0 });
  let origin = toValue(initialPosition);

  const handleClick = (event: PointerEvent) => {
    event.stopPropagation();
    const target = (event.target as SVGGElement);
    target.addEventListener('pointermove', move);
    origin = { x: event.clientX, y: event.clientY };

    target.setPointerCapture(event.pointerId);

    target.addEventListener('pointerup', () => {
      event.stopPropagation();
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      target.removeEventListener('pointermove', move);
    }, { once: true });
  }

  const move = (event: PointerEvent) => {
    event.stopPropagation();
    movement.value = {
      x: (event.clientX - origin.x),
      y: (event.clientY - origin.y)
    }
    position.value = {
      x: position.value.x + movement.value.x,
      y: position.value.y + movement.value.y
    }
    origin = { x: event.clientX, y: event.clientY };
  };

  const update = ({ x, y }: { x: number, y: number}) => {
    position.value = {
      x: position.value.x + x,
      y: position.value.y + y
    };
  };

  watch(initialPosition, () => {
    const newPosition = toValue(initialPosition);
    position.value = newPosition;
  });

  onMounted(() => {
    unref(elementRef)?.addEventListener('pointerdown', handleClick);
  });
  onUnmounted(() => {
    unref(elementRef)?.removeEventListener('pointerdown', handleClick);
  });

  return {
    position,
    movement,
    update
  }
}
