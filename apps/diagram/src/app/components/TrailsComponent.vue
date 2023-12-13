<script setup lang="ts">
type Path = {
  cursor: string
  d: string
  color: string,
  fade: number
}

defineProps<{
  paths: Path[]
  transform: string
}>();

</script>

<template>
    <g :style="{ transform }">
        <path
            v-for="path of paths"
            :key="path.cursor"
            :d="path.d"
            :style="{ stroke: path.color, opacity: path.fade }"/>
    </g>
</template>

<style scoped>
path {
  fill: none;
  stroke-width: 2px;
  pointer-events: none;
}
</style>