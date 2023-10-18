<script setup lang="ts">
import { ShapeType } from '../../composables/model/shape';

defineProps<{
    type: ShapeType,
    x: number,
    y: number,
    height: number,
    width: number
}>();
</script>

<template>
    <g
        :data-type="$props.type"
        :transform="`translate(${$props.x} ${$props.y})`">
        <rect
            v-if="$props.type === ShapeType.Rectangle"
            :x="-$props.height / 2"
            :y="-$props.width / 2"
            :width="$props.width"
            :height="$props.height">
        </rect>
        <ellipse
            v-if="$props.type === ShapeType.Ellipse"
            :rx="$props.width"
            :ry="$props.height">
        </ellipse>
    </g>
</template>

<style lang="postcss" scoped>
g rect, g ellipse {
    fill: transparent;
    stroke: #222;
}
</style>