import Router from 'vue-router';
import store from '@/store';

// Views
import SignIn from '@/views/SignIn';
import Dashboard from '@/views/Dashboard';
import InvalidDomain from '@/views/InvalidDomain';

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      redirect: '/',
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignIn,
      beforeEnter: (to, from, next) => {
        const isSignedIn = store.getters.isSignedIn;
        if(isSignedIn) {
          return next({name: 'dashboard'});
        }

        return next();
      },
    },
    {
      path: '/invalid-domain',
      name: 'invalid-domain',
      component: InvalidDomain,
      beforeEnter: (to, from, next) => {
        const isSignedIn = store.getters.isSignedIn;
        const emailDomainIsValid = store.getters.emailDomainIsValid;
        if(isSignedIn && emailDomainIsValid) {
          return next({name: 'dashboard'});
        }

        return next();
      },
    },
  ],
});

/**
 * Verify User's Access
 *
 * - redirect to the sign in page if required
 * - otherwise display the page
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const isSignedIn = store.getters.isSignedIn;
  const emailDomainIsValid = store.getters.emailDomainIsValid;

  if (requiresAuth && !isSignedIn) {
    return next({name: 'sign-in'});
  } 

  if (requiresAuth && !emailDomainIsValid) {
    return next({name: 'invalid-domain'});
  }

  return next();
});

export default router;
