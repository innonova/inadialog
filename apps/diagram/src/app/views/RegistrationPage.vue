<script setup lang="ts">
import { ref } from 'vue';

import { AuthError, createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';

import ErrorComponent from '../components/user/ErrorComponent.vue';
import SignupForm from '../components/user/SignupForm.vue'

const auth = getAuth();

const signUp = async (registration: { username: string, email: string, password: string }) => {
  try {
    const credentials = await createUserWithEmailAndPassword(
      auth, registration.email, registration.password);
    console.log(credentials.user);
    if (auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: registration.username });
    }
  } catch (error) {
    switch ((error as AuthError).code) {
    case 'auth/email-already-in-use': {
      signUpError.value = 'email-already-in-use';
      break;
    }
    default: {
      signUpError.value = 'unknown-sign-up-issue';
      console.log((error as AuthError).code);
    }
    }
  }
}
const signUpError = ref<string | null>(null);
</script>

<template v-else>
    <div id="signUp">
      <h2>Sign Up</h2>
      <ErrorComponent id="sign-up-error" :message="signUpError" />
      <SignupForm
        @sign-up="signUp"/>
        <p>Already registered? <router-link to="/"><span>
          Login</span></router-link> instead.</p>
    </div>
</template>

<style scoped>
p, h2 {
    text-align: center;
}
button {
    height: 28px;
    width: fit-content;
    margin: auto;
}
#signUp {
  margin: 30px auto;
  max-width: 260px;
}
#sign-up-error {
  margin-bottom: 16px;
}
</style>