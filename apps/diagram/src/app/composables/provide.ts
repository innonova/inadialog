import { inject } from 'vue';

export const saveInject = <T,>(key: string): T => {
  const injection = inject<T>(key);
  if (!injection) {
    throw new Error('Injection error for ${key}');
  }
  return injection
}