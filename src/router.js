import Vue from 'vue';
import Router from 'vue-router';
import {auth} from '@/firebase';

// Views
import Apply from '@/views/Apply';
import Home from '@/views/Home';
import Login from '@/views/Login';

// Form Sections
import Personal from '@/views/FormSections/Personal';
import Nationality from '@/views/FormSections/Nationality';
import Introduction from "@/views/FormSections/Introduction";

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/apply',
      component: Apply,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          component: Introduction,
        },
        {
          path: 'nationality',
          component: Nationality,
        },
        {
          path: 'personal',
          component: Personal,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/apply',
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
    // @TODO: Perform the redirect to a 'logged in' page from the Login view, not here
    //        Performing the redirect here means on initial page load of an authenticated user, the page will always
    //        be redirected and the user will be taken away from where they're expecting to be.
    // router.push('/apply');
  } else {
    router.push('/login');
  }
});

export default router;
