import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

type Hook = (event: KeyboardEvent) => Callback | void;
type Callback = () => void;

export const useHotkeys = (element: Ref<SVGSVGElement | null>) => {

  let keyDown = false;
  const callHook = (event: KeyboardEvent) => {
    const hook = registeredHooks[event.key];
    if (!keyDown && hook) {
      keyDown = true
      callbacks[event.key] = hook(event) || null;
    }
  };
  const executeCallback = (event: KeyboardEvent) => {
    const callback = callbacks[event.key];
    if (!!keyDown && callback !== null) {
      callback();
    }
    keyDown = false;
  };

  const registeredHooks: { [key: string]: Hook } = {};
  const callbacks: { [key: string]: Callback | null } = {};
  const registerHook = (key: string, hook: Hook): void => {
    registeredHooks[key] = hook;
  }

  onMounted(() => {
    element.value?.addEventListener('keydown', callHook);
    element.value?.addEventListener('keyup', executeCallback);
  });

  onUnmounted(() => {
    element.value?.removeEventListener('keydown', callHook);
    element.value?.removeEventListener('keyup', executeCallback);
  });

  return {
    registerHook
  }
}