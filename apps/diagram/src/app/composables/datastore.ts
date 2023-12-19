import { computed } from 'vue';
import { collection, query, where } from "firebase/firestore";
import { useCollection, useCurrentUser, useFirestore } from 'vuefire';

export const useDatastore = () => {
  const db = useFirestore();

  const currentUser = useCurrentUser();

  const diagramsRef = collection(db, 'diagrams');
  const diagrams = useCollection(computed(() => {
    return currentUser.value ? query(diagramsRef,
      where("author_id", "==", currentUser.value.uid)) : null
  }), { ssrKey: 'ownedDiagrams' });

  const hasDiagrams = computed(() => diagrams.value.length > 0);

  return {
    diagrams,
    hasDiagrams
  };
}