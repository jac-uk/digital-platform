import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

// Views
import Apply from '@/views/Apply';
import Login from '@/views/Login';

// Form Sections
import Introduction from '@/views/Sections/Introduction';
import Nationality from '@/views/Sections/Nationality';
import Personal from '@/views/Sections/Personal';
import Qualifications from '@/views/Sections/Qualifications';
import Experience from '@/views/Sections/Experience';
import SelfAssessment from '@/views/Sections/SelfAssessment';
import Assessors from '@/views/Sections/Assessors';
import Character from '@/views/Sections/Character';
import Preferences from '@/views/Sections/Preferences';
import Declarations from '@/views/Sections/Declarations';
import Diversity from '@/views/Sections/Diversity';
import Outreach from '@/views/Sections/Outreach';

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
          path: 'assessors',
          component: Assessors,
        },
        {
          path: 'character',
          component: Character,
        },
        {
          path: 'preferences',
          component: Preferences,
        },
        {
          path: 'declarations',
          component: Declarations,
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {x: 0, y: 0};
    }
  },
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
