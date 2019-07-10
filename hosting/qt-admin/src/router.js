import Router from 'vue-router';
import store from '@/store';

// Views
import SignIn from '@/views/SignIn';
import Dashboard from '@/views/Dashboard';

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignIn,
      meta: {
        redirectIfAuth: "dashboard",
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
      },
    },
  ]
});

/**
 * Verify User's Access
 *
 * - redirect to the sign in page if required
 * - otherwise display the page
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const redirectIfAuth = to.matched.some(x => x.meta.redirectIfAuth);
  const isSignedIn = store.getters.isSignedIn;

  if (requiresAuth && !isSignedIn) {
    // User must be logged in
    return next({name: 'sign-in'});
  } else if (redirectIfAuth && isSignedIn) {
    return next({name: to.meta.redirectIfAuth});
  }

  return next();
});

export default router;
