import Vuex from 'vuex';
import auth from '@/store/auth';
import test from '@/store/test';
import userTest from '@/store/userTest';

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',

  modules: {
    auth,
    test,
    userTest,
  },

  state: {},
  mutations: {},
  actions: {},
  getters: {},
});

export default store;
