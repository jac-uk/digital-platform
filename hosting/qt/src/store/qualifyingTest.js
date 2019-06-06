import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    setQualifyingTestId(state, id) {
      state.id = id;
    },
    setQualifyingTest(state, data) {
      state.data = data;
    },
  },
  actions: {
    async loadQualifyingTest({commit, getters}) {
      const document = getters.qualifyingTestDoc;
      if (!document) throw new Error('Set a qualifying test ID before trying to load it');
      const snapshot = await document.get();
      if (!snapshot.exists) throw new Error(`Qualifying test not found with ID "${document.id}"`);
      const data = sanitizeFirestore(snapshot.data());
      commit('setQualifyingTest', data);
    },
  },
  getters: {
    qualifyingTest: (state) => {
      return state.data;
    },
    qualifyingTestDoc: (state) => {
      return firestore.collection('qualifyingTests').doc(state.id);
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
