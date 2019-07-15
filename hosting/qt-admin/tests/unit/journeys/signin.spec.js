import {shallowMount, createLocalVue} from '@vue/test-utils';
import App from '@/App';
import Router from 'vue-router';
import Vuex from 'vuex';

jest.mock('@/firebase', () => ({
  auth: jest.fn(() => ({
    signOut: jest.fn()
  }))
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

    subject = shallowMount(App, {
      localVue,
      router,
      store,
    });
  });

  describe('unauthenticated user', () => {
    describe('when visits /', () => {
      it('should be redirected to /sign-in', () => {
        router.push('/');
        expect(subject.vm.$route.path).toBe('/sign-in');
      });
    });

  });

  describe('user signed with the wrong email domain', () => {
    const user = {
        uid: 'abc123',
        email: 'testjudicialappointments@gmail.com'
      };

      beforeEach(() => {
        store.dispatch('setCurrentUser', user);
      });

    it('should be redirected to the invalid-domain page', () => {
      router.push('/');
      expect(subject.vm.$route.path).toBe('/invalid-domain');
    })
  })

  describe('authenticated user', () => {
    const user = {
      uid: 'abc123',
      email: 'user@judicialappointments.digital'
    };

    beforeEach(() => {
      store.dispatch('setCurrentUser', user);
    })

    describe('when is trying to go to page that does not exist', () => {
      it('should be redirected to the home page', () => {
        router.push('/rtassafjshfg');
        expect(subject.vm.$route.path).toBe('/');
      })
    });

    describe('when is trying to go to the home page', () => {
      it('should be allowed to do so', () => {
        router.push('/');
        expect(subject.vm.$route.path).toBe('/');
      })
    });

    describe('when is going to the invalid-domain page', () => {
      it('should be redirected to home page', () => {
        router.push('/invalid-domain');
        expect(subject.vm.$route.path).toBe('/');
      })
    });

    describe('when is going to sign-in page', () => {
      it('should be redirected to home page', () => {
        router.push('/sign-in');
        expect(subject.vm.$route.path).toBe('/');
      })
    });
  })
});
