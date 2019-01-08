import Vue from 'vue';
import Router from 'vue-router';
import {auth} from './firebase';

// Views
import Home from './views/Home';
import Login from './views/Login';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

// Check that the user has permission to access this route (i.e. is the user logged in?)
// Redirect to login if not authenticated
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const currentUser = auth().currentUser;

  if (requiresAuth && !currentUser) {
    next('/login');
  } else {
    next();
  }
});

// Redirect page when the auth state changes (i.e. when a user logs in or out)
auth().onAuthStateChanged((user) => {
  if (user) {
    router.push('/');
  } else {
    router.push('/login');
  }
});

export default router;
