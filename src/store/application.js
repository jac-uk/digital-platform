import {firestore} from "@/firebase";
import clone from "clone";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    data: {},
    id: null,
  },
  mutations: {
    setApplication(state, data) {
      state.data = data;
    },
    setApplicationId(state, applicationId) {
      state.id = applicationId;
    },
  },
  actions: {
    async loadApplication({commit, getters}) {
      if (!getters.applicantDoc || !getters.vacancyDoc) {
        throw new Error('Applicant and Vacancy docs must exist to load Application');
      }

      const collection = firestore.collection('applications');

      const results = await collection
        .where('applicant', '==', getters.applicantDoc)
        .where('vacancy', '==', getters.vacancyDoc)
        .get();

      if (results.empty) {
        commit('setApplicationId', null);
        commit('setApplication', {});
      } else {
        const doc = results.docs[0];

        let data = doc.data();
        delete data.applicant;
        delete data.vacancy;
        data = sanitizeFirestore(data);

        commit('setApplicationId', doc.id);
        commit('setApplication', data);
      }
    },
    async saveApplication({commit, getters, state}, data) {
      const saveData = clone(data);
      saveData.applicant = getters.applicantDoc;
      saveData.vacancy = getters.vacancyDoc;
      await getters.applicationDoc.set(saveData);
      if (!state.id) {
        commit('setApplicationId', getters.applicationDoc.id);
      }
      commit('setApplication', clone(data));
    },
  },
  getters: {
    application: (state) => () => {
      return clone(state.data);
    },
    applicationDoc: (state) => {
      const collection = firestore.collection('applications');
      if (state.id) {
        return collection.doc(state.id);
      }
      return collection.doc();
    },
  },
};

export default module;
