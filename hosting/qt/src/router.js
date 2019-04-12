import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

// Views
import Login from '@/views/Login';
import TakeTest from '@/views/TakeTest';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/take-test',
      component: TakeTest,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '*',
      redirect: '/take-test',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {x: 0, y: 0};
    }
  },
});

/**
 * Verify User's Access
 *
 * - redirect to the login page if required
 * - show 'verify your email' page if required
 * - otherwise display the page
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const isLoggedIn = store.getters.isLoggedIn;
  const isEmailVerified = store.getters.isEmailVerified;

  if (requiresAuth && !isLoggedIn) {
    // User must be logged in
    return next({name: 'login'});
  }

  if (requiresAuth && !isEmailVerified) {
    // User must verify their email address
    return next({name: 'verify-email'});
  }

  return next();
});

export default router;
