import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    setQualifyingTest(state, {id, data}) {
      state.id = id;
      state.data = data;
    },
  },
  actions: {
    async loadQualifyingTest({commit, getters}, id) {
      if (!id) throw new Error('Specify a qualifying test ID to load');
      const doc = firestore.collection('qualifyingTests').doc(id);
      const snapshot = await doc.get();
      if (!snapshot.exists) throw new Error(`Qualifying test not found with ID "${id}"`);
      const data = sanitizeFirestore(snapshot.data());
      commit('setQualifyingTest', {id, data});
    },
  },
  getters: {
    qualifyingTest: (state) => {
      return state.data;
    },
    qualifyingTestHasOpened: (state) => {
      const now = new Date();
      const open = state.data.openingTime;
      return open <= now;
    },
    qualifyingTestHasClosed: (state) => {
      const now = new Date();
      const close = state.data.closingTime;
      return close <= now;
    },
    qualifyingTestIsOpen: (state, getters) => {
      return (getters.qualifyingTestHasOpened && !getters.qualifyingTestHasClosed);
    },
  },
};

export default module;
