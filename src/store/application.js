import {firestore} from "@/firebase";
import clone from "clone";
import docRefs from '@/store/docRefs';
import sanitizeFirestore from "@/utils/sanitize-firestore";

const module = {
  state: {
    application: {},
  },
  mutations: {
    setApplication(state, data) {
      state.application = data;
    },
  },
  actions: {
    async loadApplication({commit}) {
      if (!docRefs.applicant || !docRefs.vacancy) {
        throw new Error('Applicant and Vacancy must be loaded before Application');
      }

      const collection = firestore.collection('applications');

      const results = await collection
        .where('applicant', '==', docRefs.applicant)
        .where('vacancy', '==', docRefs.vacancy)
        .get();

      if (results.empty) {
        docRefs.application = collection.doc();
        commit('setApplication', {});
      } else {
        const doc = results.docs[0];
        docRefs.application = doc.ref;

        let data = doc.data();
        delete data.applicant;
        delete data.vacancy;
        data = sanitizeFirestore(data);

        commit('setApplication', data);
      }
    },
    async saveApplication({commit}, data) {
      const saveData = clone(data);
      saveData.applicant = docRefs.applicant;
      saveData.vacancy = docRefs.vacancy;
      await docRefs.application.set(saveData);
      commit('setApplication', clone(data));
    },
  },
  getters: {
    application: (state) => () => {
      return clone(state.application);
    },
  },
};

export default module;
