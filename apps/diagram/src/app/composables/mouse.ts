import { onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';

interface Options {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

interface EventMap {
  'contextmenu': MouseEvent
  'pointerdown': PointerEvent
  'pointermove': PointerEvent
  'pointerout': PointerEvent
  'pointerup': PointerEvent
  'wheel': WheelEvent
}

interface HookMap {
  get<T extends keyof EventMap>(k: keyof EventMap): {
    eventListener: (event: EventMap[T]) => void,
    capture: boolean,
    passive: boolean
  } 
  set<T extends keyof EventMap>(
    k: T,
    v: { eventListener: (event: EventMap[T]) => void, capture: boolean, passive: boolean }
  ): this
}
interface HookMapConstructor {
  new(): HookMap
}
const HookMap: HookMapConstructor = Map;

export const useMouse = (element: Ref<SVGSVGElement | null>) => {
  const position: Ref<{ x: number, y: number }> = ref({ x: 0, y: 0 });

  const update = (event: PointerEvent) => {
    position.value = { x: event.clientX, y: event.clientY };
  };

  const registeredHooks: HookMap = new HookMap();
  const registerHook = <T extends keyof EventMap>(
    type: T,
    eventListener: (event: EventMap[T]) => void,
    { capture, once, passive }: Options = {}
  ) => {
    if (once) {
      element.value?.addEventListener(type, eventListener, { once: true });
    } else {
      registeredHooks.set(type, { eventListener, capture: !!capture, passive: !!passive });
      element.value?.addEventListener(type, eventListener, { capture, passive });
    }
  }

  const unregisterHook = (type: keyof EventMap) => {
    const hook = registeredHooks.get(type);
    element.value?.removeEventListener(type, hook.eventListener, { capture: hook.capture });
  }

  onMounted(() => {
    element.value?.addEventListener('pointermove', update);
  });

  onUnmounted(() => {
    element.value?.removeEventListener('pointermove', update);
  });

  return {
    position,
    registerHook,
    unregisterHook
  };
}