import { createRouter, createWebHistory } from 'vue-router';
import ControlPage from './views/ControlPage.vue';
import CursorPage from './views/CursorPage.vue';
import HomePage from './views/HomePage.vue';
import ViewPage from './views/ViewPage.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
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
    },
    {
      path: '/cursor',
      name: 'Cursor',
      component: CursorPage,
      meta: { title: 'Cursor' },
    },
    {
      path: '/view/:diagramId',
      name: 'View',
      component: ViewPage,
      props: true,
      meta: { title: 'View' },
    },
  ],
});

router.afterEach((to, _from) => {
  const parent = to.matched.find((record) => record.meta.title);
  const parentTitle = parent ? parent.meta.title : null;
  document.title = to.meta.title || parentTitle || 'diagram';
});

export default router;
