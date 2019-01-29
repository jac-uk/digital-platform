import {firestore} from "@/firebase";
import clone from "clone";
import docRefs from '@/store/docRefs';
import sanitizeFirestore from "@/utils/sanitize-firestore";

const module = {
  state: {
    vacancy: {},
    vacancyId: null,
  },
  mutations: {
    setVacancy(state, data) {
      state.vacancy = data;
    },
    setVacancyId(state, vacancyId) {
      state.vacancyId = vacancyId;
      docRefs.vacancy = firestore.collection('vacancies').doc(vacancyId);
    },
  },
  actions: {
    async loadVacancy({commit, state, getters}) {
      if (!state.vacancyId) {
        throw new Error('You must set the Vacancy ID before attempting to load it');
      }

      docRefs.vacancy = firestore.collection('vacancies').doc(state.vacancyId);
      const snapshot = await docRefs.vacancy.get();
      const data = sanitizeFirestore(snapshot.data());
      commit('setVacancy', data);
    },
    async saveVacancy({commit}, data) {
      await docRefs.vacancy.set(data);
      commit('setVacancy', clone(data));
    },
  },
  getters: {
    vacancy: (state) => () => {
      return clone(state.vacancy);
    },
  },
};

window.docRefs = docRefs;

export default module;
