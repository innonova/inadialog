<script setup lang="ts">

defineEmits<{
    (event: 'new'): void,
    (event: 'clear'): void
}>();
</script>

<template>
    <div id="menu">
        <button
            title="New Canvas"
            @click="$emit('new')"
        >N</button>
        <button
            title="Clear Canvas"
            @click="$emit('clear')"
        >C</button>
    </div>
</template>

<style lang="postcss">
#menu {
    position: absolute;
    top: -42px;
    left: 50%;
    padding: 16px 24px 16px;
    border: 1px solid;
    border-radius: 5px;
    transition: top 0.25s;
}
#menu:hover {
    top: -12px;
}
#menu button {
    width: 24px;
    height: 24px;
}
#menu button:not(:last-child) {
    margin-right: 4px;
}
</style>