import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBwhE_gfrEQsk3UU3le_AAtyG0K4V4qDq8',
  authDomain: 'test-158ff.firebaseapp.com',
  projectId: 'test-158ff',
  storageBucket: 'test-158ff.appspot.com',
  messagingSenderId: '715948310163',
  appId: '1:715948310163:web:ffdc15d5e90b712b97d766',
  measurementId: 'G-MSGBD9F1QY',
};

const app = initializeApp(firebaseConfig);

console.log(app);
