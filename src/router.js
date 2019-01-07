import Vue from 'vue';
import Router from 'vue-router';
import firebase from './firebase';

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
  const currentUser = firebase.auth.currentUser;

  if (requiresAuth && !currentUser) {
    next('/login');
  } else {
    next();
  }
});

// @TODO: Add a watcher for Firebase Auth onAuthStateChange to show the appropriate view
// Useful example: https://medium.com/dailyjs/authenticating-a-vue-js-application-with-firebase-ui-8870a3a5cff8#e3c8

export default router;
