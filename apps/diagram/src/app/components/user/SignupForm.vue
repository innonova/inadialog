<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
  username?: string,
  email?: string,
  password?: string
}>();

defineEmits<{
  'signUp': [value: { username: string, email: string, password: string }]
}>();

const values = reactive({
  username: props.username || '',
  email: props.email || '',
  password: props.password || ''
});
</script>

<template>
    <form @submit.prevent="$emit('signUp', values)">
        <input
            v-model="values.username"
            type="text"
            placeholder="Username"
            required />
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
        <button>Sign Up</button>
    </form>
</template>

<style scoped>
h2 {
    text-align: center;
}
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