<script setup lang="ts">

defineEmits<{
    (event: 'new'): void,
    (event: 'clear'): void
}>();
</script>

<template>
    <div id="menu">
        <div>
            <button
                title="New Canvas"
                @click="$emit('new')">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
            </button>
            <button
                title="Clear Canvas"
                @click="$emit('clear')">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 -3 24 24">
                        <path d="M12.48 3 7.73 7.75 3 12.59a2 2 0 0 0 0 2.82l4.3 4.3A1 1 0 0 0 8 20h12v-2h-7l7.22-7.22a2 2 0 0 0 0-2.83L15.31 3a2 2 0 0 0-2.83 0zM8.41 18l-4-4 4.75-4.84.74-.75 4.95 4.95-4.56 4.56-.07.08z" />
                    </svg>
            </button>
        </div>
        <div class="handle">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-pull-down"
                viewBox="0 0 80 10"
                aria-hidden="true">
                <path d="M 0,0 l 40 10 l 40 -10"></path>
            </svg>
        </div>
    </div>
</template>

<style lang="postcss">
#menu {
    position: absolute;
    top: -50px;
    left: 50%;
    padding: 16px 24px 2px;
    border: 1px solid;
    border-radius: 5px;
    transition: top 0.25s;
}
#menu:hover {
    top: -12px;
}
#menu button:not(:last-child) {
    margin-right: 4px;
}
#menu .handle {
    text-align: center;
}
#menu button svg {
    height: 24px;
    width: 24px;
}
</style>