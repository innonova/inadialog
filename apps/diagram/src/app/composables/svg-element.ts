import { computed, onMounted, onScopeDispose, onUnmounted, reactive, ref, unref, watch } from 'vue';
import type { Ref } from 'vue';

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
  ref: Ref<SVGGElement | null>,
  initialPosition: { x: number, y: number } = { x: 0, y: 0 }
) {
  const position = reactive({ x: initialPosition.x, y: initialPosition.y });
  let origin = initialPosition

  const handleClick = (event: PointerEvent) => {
    const target = (event.target as SVGGElement);
    target.addEventListener('pointermove', move);
    origin = { x: event.clientX, y: event.clientY };

    target.addEventListener('pointerup', () => {
      target.removeEventListener('pointermove', move);
    }, { once: true });
  }

  const move = (event: PointerEvent) => {
    position.x = position.x + (event.clientX - origin.x);
    position.y = position.y + (event.clientY - origin.y);
    origin = { x: event.clientX, y: event.clientY };
  };

  onMounted(() => {
    unref(ref)?.addEventListener('pointerdown', handleClick);
  });
  onUnmounted(() => {
    unref(ref)?.removeEventListener('pointerdown', handleClick);
  });

  return {
    position
  }
}
