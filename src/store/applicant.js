import {firestore} from "@/firebase";
import clone from "clone";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    data: {},
  },
  mutations: {
    setApplicant(state, data) {
      state.data = data;
    },
  },
  actions: {
    async loadApplicant({commit, state, getters}) {
      const snapshot = await getters.applicantDoc.get();
      const data = sanitizeFirestore(snapshot.data());
      commit('setApplicant', data);
    },
    async saveApplicant({commit, getters}, data) {
      await getters.applicantDoc.set(data);
      commit('setApplicant', clone(data));
    },
  },
  getters: {
    applicant: (state) => () => {
      return clone(state.data);
    },
    applicantDoc: (state, getters) => {
      if (getters.currentUserId) {
        return firestore.collection('applicants').doc(getters.currentUserId);
      }
      return null;
    },
  },
};

export default module;
