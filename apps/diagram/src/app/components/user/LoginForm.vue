<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
  email?: string,
  password?: string
}>();

defineEmits<{
  'login': [value: { email: string, password: string }]
}>();

const values = reactive({
  email: props.email || '',
  password: props.password || ''
});
</script>

<template>
    <form @submit.prevent="$emit('login', values)">
        <input
            v-model="values.email"
            type="email"
            placeholder="Email"
            required />
        <input
            v-model="values.password"
            type="password"
            placeholder="Password"
            required />
        <button>Log in</button>
    </form>
</template>

<style scoped>
span {
    text-decoration: underline;
    cursor: pointer;
    color: blue;
}
form {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
}
input, button {
    height: 28px;
}
input {
    padding-left: 10px;
}
button {
    width: fit-content;
    margin: auto;
}
</style>