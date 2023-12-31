<script setup lang="ts">
import { computed, ref } from 'vue';

import ErrorComponent from '../components/user/ErrorComponent.vue';
import LoginForm from '../components/user/LoginForm.vue';
import {
  AuthError,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { useCurrentUser } from 'vuefire';
import ProfileComponent from '../components/user/ProfileComponent.vue';
import { useDatastore } from '../composables/datastore';

const auth = getAuth();

const showLogin = ref(true);
const isLoggedIn = computed(() => !!useCurrentUser().value);
const loginError = ref<string | null>(null)

const currentUser = ref<User | null>()
auth.onAuthStateChanged((user) => {
  currentUser.value = user
});

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

const username = computed(() => !currentUser.value?.isAnonymous &&
  currentUser.value?.displayName ||
  'Anonymous');

const { diagrams, hasDiagrams } = useDatastore();
</script>

<template>
    <div v-if="!isLoggedIn">
        <template v-if="showLogin">
          <div id="login">
            <h2>Log in</h2>
            <ErrorComponent id="login-error" :message="loginError"/>
            <LoginForm
                @login="logIn"/>
            <p> No account yet? <router-link to='/registration'><span>
                Sign up</span></router-link> instead.</p>
          </div>
        </template>
    </div>
    <div v-else>
        <h2>Welcome {{ username }}</h2>
        <button @click="logOut">Log out</button>
        <h3>Your Diagrams</h3>
        <div>
          <ul v-if="hasDiagrams">
            <li
              v-for="diagram of diagrams"
              :key="diagram.id">{{ diagram.id }} (author: {{ diagram.author_id }})</li>
          </ul>
          <div v-else>
            <span>No diagrams found</span>
          </div>
        </div>
    </div>
    <ProfileComponent
      v-if="currentUser !== null"
      id="profile"
      :profile="currentUser"/>
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
#login {
  margin: 30px auto;
  max-width: 260px;
}
#login-error {
  margin-bottom: 16px;
}
#profile {
  position: absolute;
  top: 8px;
  right: 12px;
}
</style>