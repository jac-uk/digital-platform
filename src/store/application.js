import {firestore} from "@/firebase";
import clone from "clone";
import sanitizeFirestore from "@/utils/sanitizeFirestore";

const module = {
  state: {
    data: {},
    id: null,
  },
  mutations: {
    setApplication(state, id, data) {
      state.id = id;
      state.data = data;
    },
  },
  actions: {
    async loadApplication({commit, getters}) {
      if (!getters.applicantDoc || !getters.vacancyDoc) {
        throw new Error('Applicant and Vacancy docs must exist to load an Application');
      }

      const collection = firestore.collection('applications');

      const results = await collection
        .where('applicant', '==', getters.applicantDoc)
        .where('vacancy', '==', getters.vacancyDoc)
        .get();

      if (results.empty) {
        commit('setApplication', null, {});
      } else {
        const doc = results.docs[0];

        let data = doc.data();
        delete data.applicant;
        delete data.vacancy;
        data = sanitizeFirestore(data);

        commit('setApplication', doc.id, data);
      }
    },
    async saveApplication({commit, getters, state}, data) {
      if (!getters.applicantDoc || !getters.vacancyDoc) {
        throw new Error('Applicant and Vacancy docs must exist to save an Application');
      }
      const saveData = clone(data);
      saveData.applicant = getters.applicantDoc;
      saveData.vacancy = getters.vacancyDoc;
      await getters.applicationDoc.set(saveData);
      commit('setApplication', getters.applicationDoc.id, clone(data));
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
