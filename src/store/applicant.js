import {firestore} from "@/firebase";
import clone from "clone";
import docRefs from '@/store/docRefs';
import sanitizeFirestore from "@/utils/sanitize-firestore";

const module = {
  state: {
    applicant: {},
  },
  mutations: {
    setApplicant(state, data) {
      state.applicant = data;
    },
  },
  actions: {
    async loadApplicant({commit, state, getters}) {
      docRefs.applicant = firestore.collection('applicants').doc(getters.currentUserId);
      const snapshot = await docRefs.applicant.get();
      const data = sanitizeFirestore(snapshot.data());
      commit('setApplicant', data);
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
};

export default module;
