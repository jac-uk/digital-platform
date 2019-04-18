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
    qtIsOpen: (state, getters) => {
      return (getters.qtHasOpened && !getters.qtHasClosed);
    },
    qtPhase: (state) => (phaseTitle) => {
      return state.data.phases.find(phase => phase.title === phaseTitle);
    },
    qtPhaseBefore: (state) => (phaseTitle) => {
      const index = state.data.phases.findIndex(phase => phase.title === phaseTitle);
      if (index > 0) {
        return state.data.phases[index-1];
      } else {
        return null;
      }
    },
  },
};

export default module;
