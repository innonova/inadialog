<script setup lang="ts">
import { computed, ref } from 'vue';

import ErrorComponent from '../components/user/ErrorComponent.vue';
import LoginForm from '../components/user/LoginForm.vue';
import SignupForm from '../components/user/SignupForm.vue';
import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { useCurrentUser } from 'vuefire';

const auth = getAuth();

const showLogin = ref(true);
const isLoggedIn = computed(() => !!useCurrentUser().value);
const loginError = ref<string | null>(null)

const currentUser = ref<User | null>()
auth.onAuthStateChanged((user) => {
  currentUser.value = user
});

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

const logIn = async (login: { email: string, password: string }) => {
  try {
    await signInWithEmailAndPassword(auth, login.email, login.password);
  } catch (error) {
    switch ((error as AuthError).code) {
    case 'auth/invalid-login-credentials': {
      loginError.value = 'invalid-login-credentials';
      break;
    }
    default: {
      loginError.value = 'unknown-login-issue';
      console.log((error as AuthError).code);
    }
    }
  }
}

const logOut = async () => {
  await signOut(auth);
}

</script>

<template>
    <div v-if="!isLoggedIn">
        <template v-if="showLogin">
          <div id="login">
            <h2>Log in</h2>
            <ErrorComponent id="login-error" :message="loginError"/>
            <LoginForm
                @login="logIn"/>
            <p> No account yet? <span @click="() => showLogin = false">
                Sign up</span> instead.</p>
          </div>
        </template>
        <template v-else>
          <div id="signUp">
            <h2>Sign Up</h2>
            <ErrorComponent id="sign-up-error" :message="signUpError" />
            <SignupForm
              @sign-up="signUp"/>
              <p>Already registered? <span @click="() => showLogin = true">
                Login</span> instead.</p>
          </div>
        </template>
    </div>
    <div v-else>
        <h2>Welcome {{ currentUser?.displayName }}</h2>
        <button @click="logOut">Log out</button>
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
#login, #signUp {
  margin: 30px auto;
  max-width: 260px;
}
#login-error, #sign-up-error {
  margin-bottom: 16px;
}
</style>