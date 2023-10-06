import { createApp } from 'vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { initializeApp } from 'firebase/app';
import App from './App.vue';
import i18n from './i18n';
import router from './router';

const firebaseConfig = {
  apiKey: 'AIzaSyCZ6t0SdebPd8wBMsg99uHUHGYxCtqq0Ks',
  authDomain: 'inadialog-9e1a4.firebaseapp.com',
  databaseURL:
    'https://inadialog-9e1a4-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'inadialog-9e1a4',
  storageBucket: 'inadialog-9e1a4.appspot.com',
  messagingSenderId: '713659559004',
  appId: '1:713659559004:web:c6b76d8a945eab38998a99',
  measurementId: 'G-4NTP18BMMC',
};

const firebaseApp = initializeApp(firebaseConfig);

createApp(App)
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
  .use(router)
  .use(i18n)
  .mount('#app');
