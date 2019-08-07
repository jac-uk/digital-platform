import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import store from '@/store';

const initSentry = () => {
  Sentry.init({
    dsn: 'https://2ae111f2a62d4f7bbe84aaf868f0f0d5@sentry.io/1472344',
    environment: process.env.NODE_ENV,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })],
  });
  setUserScope();
};

const setUserScope = () => {
  Sentry.configureScope((scope) => {
    scope.setUser({
      id: store.getters.currentUserId,
      email: store.getters.currentUserEmail,
    });
  });
};

// Update the Sentry user scope when the current user changes in the Vuex store
store.watch((state, getters) => (getters.currentUserId), setUserScope);

export { initSentry };
