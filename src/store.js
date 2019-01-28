import Vue from 'vue';
import Vuex from 'vuex';
import {auth, firestore, Timestamp} from '@/firebase';
import clone from 'clone';

Vue.use(Vuex);

const docRefs = {
  applicant: null,
};

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',

  state: {
    applicant: {},
  },
  mutations: {
    setApplicant(state, data) {
      state.applicant = data;
    },
  },
  actions: {
    async loadApplicant({commit, state}, userId) {
      docRefs.applicant = firestore.collection('applicants').doc(userId);
      const snapshot = await docRefs.applicant.get();

      // Convert serialized Timestamp objects to Date objects
      const parsed = JSON.parse(JSON.stringify(snapshot.data()), (key, value) => {
        if (typeof value == 'object' && typeof value.seconds == 'number' && typeof value.nanoseconds == 'number') {
          value = new Timestamp(value.seconds, value.nanoseconds).toDate();
        }
        return value;
      });

      commit('setApplicant', parsed);
    },
    async saveApplicant({commit}, data) {
      await docRefs.applicant.set(data);
      commit('setApplicant', clone(data));
    },
  },
  getters: {
    applicant: (state) => () => {
      return clone(state.applicant);
    },
  },
});

export default store;
