import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router';

import { getCurrentUser } from 'vuefire';
import { getAuth, signInAnonymously } from 'firebase/auth';

import ControlPage from './views/ControlPage.vue';
import CursorPage from './views/CursorPage.vue';
import HomePage from './views/HomePage.vue';
import RegistrationPage from './views/RegistrationPage.vue';
import ViewPage from './views/ViewPage.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

const necessaryLogin = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
  // login anonymously if no user exists
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    await signInAnonymously(getAuth());
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve({ el: to.hash });
        }, 500);
      });
    }
    if (savedPosition) {
      return savedPosition;
    }
    if (to.meta.noScroll && from.meta.noScroll) {
      return {};
    }
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: { title: 'diagram' },
    },
    {
      path: '/control',
      name: 'Control',
      component: ControlPage,
      meta: { title: 'Control' },
      beforeEnter: [necessaryLogin]
    },
    {
      path: '/cursor',
      name: 'Cursor',
      component: CursorPage,
      meta: { title: 'Cursor' },
      beforeEnter: [necessaryLogin]
    },
    {
      path: '/view/:diagramId',
      name: 'View',
      component: ViewPage,
      props: true,
      meta: { title: 'View' },
      beforeEnter: [necessaryLogin]
    },
    {
      path: '/registration',
      name: 'Registration',
      component: RegistrationPage,
      meta: { title: 'Registration' }
    }
  ],
});

router.beforeEach(async (to, _from) => {
  const currentUser = await getCurrentUser();
  if (currentUser && to.name === 'Registration') {
    return { name: 'Home' }
  }
})

router.afterEach((to, _from) => {
  const parent = to.matched.find((record) => record.meta.title);
  const parentTitle = parent ? parent.meta.title : null;
  document.title = to.meta.title || parentTitle || 'diagram';
});

export default router;
