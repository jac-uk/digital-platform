import {shallowMount, createLocalVue} from '@vue/test-utils';
import App from '@/App';
import Router from 'vue-router';
import Vuex from 'vuex';

jest.mock('@/firebase', () => ({
  auth: jest.fn(() => ({
    signOut: jest.fn(),
  })),
}));

describe('Sign in journey', () => {
  let subject;
  let router;
  let store;
  beforeEach(() => {
    const localVue = createLocalVue();
    localVue.use(Router);
    localVue.use(Vuex);

    router = require('@/router').default;
    store = require('@/store').default;

    /**
     * Disable custom scrollBehaviour function: window.scrollTo isn't implemented in jsdom, which is what jest uses to
     * emulate the browser, so we won't test this behaviour.
     * Without removing it, jsdom throws errors due to use of unimplemented functionality.
     */
    delete router.options.scrollBehavior;

    subject = shallowMount(App, {
      localVue,
      router,
      store,
    });
  });

  describe('unauthenticated user', () => {
    describe('when I visit /', () => {
      it('redirects to /sign-in', () => {
        router.push('/');
        expect(subject.vm.$route.path).toBe('/sign-in');
      });
    });
  });

  describe('authenticated user', () => {
    const user = {
      uid: 'abc123',
      email: 'user@example.com',
      emailVerified: true,
    };

    beforeEach(() => {
      store.dispatch('setCurrentUser', user);
    });

    describe('when I visit /', () => {
      it('redirects to /take-test/Q3QPebYC4it3Orp4RtA7', () => {
        router.push('/');
        expect(subject.vm.$route.path).toBe('/take-test/Q3QPebYC4it3Orp4RtA7');
      });
    });
  });
});
