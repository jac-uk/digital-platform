import {firestore} from '@/firebase';
import sanitizeFirestore from '@/utils/sanitizeFirestore';

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    setTestId(state, id) {
      state.id = id;
    },
    setTest(state, data) {
      state.data = data;
    },
  },
  actions: {
    async loadTest({commit, getters}) {
      const document = getters.testDoc;
      if (!document) throw new Error('Set a test ID before trying to load it');
      const snapshot = await document.get();
      if (!snapshot.exists) throw new Error(`Test not found with ID "${document.id}"`);
      const data = sanitizeFirestore(snapshot.data());
      commit('setTest', data);
    },
  },
  getters: {
    test: (state) => {
      return state.data;
    },
    testDoc: (state) => {
      if (!state.id) return null;
      return firestore.collection('tests').doc(state.id);
    },
    testHasOpened: (state) => {
      const now = new Date();
      const open = state.data.openingTime;
      return open <= now;
    },
    testHasClosed: (state) => {
      const now = new Date();
      const close = state.data.closingTime;
      return close <= now;
    },
    testIsOpen: (state, getters) => {
      return (getters.testHasOpened && !getters.testHasClosed);
    },
  },
};

export default module;
