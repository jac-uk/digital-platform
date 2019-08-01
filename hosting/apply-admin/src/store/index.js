import Vue from 'vue';
import Vuex from 'vuex';

// Modules
import applicants from '@/store/modules/applicants';
import applications from '@/store/modules/applications';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  actions: {
    // eslint-disable-next-line
    init: async ({ dispatch }) => {
      await Promise.all([]);
    },
  },
  modules: {
    applicants,
    applications,
  },
});

store.dispatch('init');

export default store;
