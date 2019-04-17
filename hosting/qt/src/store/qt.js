import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    data: {},
    id: null,
  },
  mutations: {
    setQt(state, data) {
      state.data = data;
    },
    setQtId(state, id) {
      state.id = id;
    },
  },
  actions: {
    async loadQt({commit, state, getters}) {
      if (!state.id) {
        throw new Error('You must set the QT ID first using the setQtId mutation');
      }

      const snapshot = await getters.qtDoc.get();
      const data = sanitizeFirestore(snapshot.data());
      commit('setQt', data);
    },
  },
  getters: {
    qt: (state) => {
      return state.data;
    },
    qtDoc: (state) => {
      if (state.id) {
        return firestore.collection('qts').doc(state.id);
      }
      return null;
    },
    qtHasOpened: (state) => {
      const now = new Date();
      const open = state.data.opening_time;
      return open <= now;
    },
    qtHasClosed: (state) => {
      const now = new Date();
      const close = state.data.closing_time;
      return close <= now;
    },
  },
};

export default module;
