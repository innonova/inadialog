<script setup lang="ts">
import DiagramView from '../components/DiagramView.vue';

defineProps<{
  diagramId: string
}>();
</script>

<template>
    <DiagramView :diagramId="$props.diagramId"/>
</template>