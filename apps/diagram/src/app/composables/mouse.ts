import { onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';

export const useMouse = (element: Ref<SVGSVGElement | null>) => {
  const position: Ref<{ x: number, y: number }> = ref({ x: 0, y: 0 });

  const update = (event: PointerEvent) => {
    position.value = { x: event.clientX, y: event.clientY };
  };

  onMounted(() => {
    element.value?.addEventListener('pointermove', update);
  });

  onUnmounted(() => {
    element.value?.removeEventListener('pointermove', update);
  });

  return { position };
}