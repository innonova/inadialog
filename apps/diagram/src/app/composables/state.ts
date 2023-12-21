import { computed, ref } from 'vue';
import type { Ref } from 'vue';

export const useState = () => {
  const states = ['idle', 'edit'] as const;
  const state: Ref<number> = ref(0);
  
  const toggle = () => {
    state.value = (state.value + 1) % states.length;
  };
  
  return {
    state: computed(() => states[state.value]),
    toggle
  };
};