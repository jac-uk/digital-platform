import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

// Views
import Apply from '@/views/Apply';
import Login from '@/views/Login';

// Form Sections
import Introduction from '@/views/FormSections/Introduction';
import Nationality from '@/views/FormSections/Nationality';
import Personal from '@/views/FormSections/Personal';
import Qualifications from '@/views/FormSections/Qualifications';
import Experience from '@/views/FormSections/Experience';
import SelfAssessment from '@/views/FormSections/SelfAssessment';
import Character from '@/views/FormSections/Character';
import Diversity from '@/views/FormSections/Diversity';
import Outreach from '@/views/FormSections/Outreach';

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
        {
          path: 'qualifications',
          component: Qualifications,
        },
        {
          path: 'experience',
          component: Experience,
        },
        {
          path: 'self-assessment',
          component: SelfAssessment,
        },
        {
          path: 'character',
          component: Character,
        },
        {
          path: 'diversity',
          component: Diversity,
        },
        {
          path: 'outreach',
          component: Outreach,
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
  const isLoggedIn = store.getters.isLoggedIn;

  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
