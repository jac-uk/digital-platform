import Vuex from 'vuex';
import auth from '@/store/auth';
import qt from '@/store/qt';
import qtSummary from '@/store/qtSummary';
import qtPhaseStates from '@/store/qtPhaseStates';
import qualifyingTest from '@/store/qualifyingTest';

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',

  modules: {
    auth,
    qt,
    qtSummary,
    qtPhaseStates,
    qualifyingTest,
  },

  state: {},
  mutations: {},
  actions: {},
  getters: {},
});

export default store;
