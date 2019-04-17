import Vuex from 'vuex';
import auth from '@/store/auth';
import qt from '@/store/qt';
import qtSummary from '@/store/qtSummary';

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',

  modules: {
    auth,
    qt,
    qtSummary,
  },

  state: {},
  mutations: {},
  actions: {},
  getters: {},
});

export default store;
