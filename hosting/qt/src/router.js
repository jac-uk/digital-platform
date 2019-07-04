import Router from 'vue-router';
import store from '@/store';

// Views
import SignIn from '@/views/SignIn';
import TakeTest from '@/views/TakeTest';
import VerifyEmail from '@/views/VerifyEmail';

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignIn,
    },
    {
      path: '/take-test',
      component: TakeTest,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/take-test/:id',
      component: TakeTest,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmail,
      beforeEnter: (to, from, next) => {
        const isSignedIn = store.getters.isSignedIn;
        const isEmailVerified = store.getters.isEmailVerified;

        if (!isSignedIn) {
          // User must be logged in
          return next({name: 'sign-in'});
        }

        if (isEmailVerified) {
          // Email is already verified, skip this page
          return next('/');
        }

        return next();
      },
    },
    {
      path: '*',
      redirect: '/take-test/Q3QPebYC4it3Orp4RtA7',
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
 * - redirect to the sign in page if required
 * - show 'verify your email' page if required
 * - otherwise display the page
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const isSignedIn = store.getters.isSignedIn;
  const isEmailVerified = store.getters.isEmailVerified;

  if (requiresAuth && !isSignedIn) {
    // User must be logged in
    return next({name: 'sign-in'});
  }

  if (requiresAuth && !isEmailVerified) {
    // User must verify their email address
    return next({name: 'verify-email'});
  }

  return next();
});

export default router;
