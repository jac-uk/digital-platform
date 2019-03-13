import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

// Views
import Apply from '@/views/Apply';
import Login from '@/views/Login';
import VerifyEmail from '@/views/VerifyEmail';

// Form Sections
import Introduction from '@/views/Sections/Introduction/Edit';
import Nationality from '@/views/Sections/Nationality/Edit';
import Personal from '@/views/Sections/Personal/Edit';
import Qualifications from '@/views/Sections/Qualifications/Edit';
import Experience from '@/views/Sections/Experience/Edit';
import SelfAssessment from '@/views/Sections/SelfAssessment/Edit';
import Assessors from '@/views/Sections/Assessors/Edit';
import Character from '@/views/Sections/Character/Edit';
import Preferences from '@/views/Sections/Preferences/Edit';
import Declarations from '@/views/Sections/Declarations/Edit';
import Diversity from '@/views/Sections/Diversity/Edit';
import Outreach from '@/views/Sections/Outreach/Edit';
import Review from '@/views/Sections/Review/Edit';

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
        {
          path: 'review',
          component: Review,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmail,
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
    next('/login');
  } else if (requiresAuth && !isEmailVerified) {
    next('/verify-email');
  } else {
    next();
  }
});

export default router;
