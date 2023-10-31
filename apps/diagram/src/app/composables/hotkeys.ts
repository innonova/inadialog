import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export const useHotkeys = (element: Ref<SVGSVGElement | null>) => {

  const keyHandler = (event: KeyboardEvent) => {
    console.log(event);
  };

  onMounted(() => {
    element.value?.addEventListener('keydown', keyHandler);
  });

  onUnmounted(() => {
    element.value?.removeEventListener('keydown', keyHandler);
  });
}