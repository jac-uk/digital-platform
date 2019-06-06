import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";
import merge from 'deepmerge';

let unsubscribe;

const commitSnapshot = (commit, snapshot) => {
  if (snapshot.exists) {
    let data = snapshot.data();
    delete data.userUid;
    delete data.qualifyingTest;
    data = sanitizeFirestore(data);
    commit('setUserQualifyingTest', {id: snapshot.id, data});
  } else {
    commit('resetUserQualifyingTest');
  }
};

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    resetUserQualifyingTest(state) {
      state.id = null;
      state.data = {};
    },
    setUserQualifyingTest(state, {id, data}) {
      state.id = id;
      state.data = data;
    },
    updateUserQualifyingTest(state, {id, data}) {
      state.id = id;
      state.data = merge(state.data, data);
    },
  },
  actions: {
    async loadUserQualifyingTest({commit, getters}) {
      const collection = firestore.collection('usersQualifyingTests');

      const results = await collection
        .where('qualifyingTest', '==', getters.qualifyingTestDoc)
        .where('userUid', '==', getters.currentUserId)
        .get();

      if (results.empty) {
        commit('resetUserQualifyingTest');
      } else {
        const snapshot = results.docs[0];
        commitSnapshot(commit, snapshot);
      }
    },
    subscribeUserQualifyingTest({commit, getters}) {
      return;
      if (typeof unsubscribe == 'function') return; // Don't subscribe again if already subscribed
      unsubscribe = getters.userQualifyingTestDoc.onSnapshot((snapshot) => {
        if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          commitSnapshot(commit, snapshot);
        }
      });
    },
    unsubscribeQtSummary() {
      if (typeof unsubscribe === 'function') unsubscribe();
      unsubscribe = undefined; // Reset so we can subscribe again
    },
    async startQualifyingTest({commit, getters}) {
      const saveData = {
        startedAt: new Date(),
        qualifyingTest: getters.qualifyingTestDoc,
        userUid: getters.currentUserId,
      };
      const doc = getters.userQualifyingTestDoc;
      await doc.set(saveData, {merge: true});
      commit('updateUserQualifyingTest', {id: doc.id, data: saveData});
    },
  },
  getters: {
    userQualifyingTest: (state) => {
      return state.data;
    },
    userQualifyingTestDoc: (state, getters) => {
      return firestore.collection('usersQualifyingTests').doc(state.id);
    },
    /*qtPhaseSummary: (state, getters) => (phaseTitle) => {
      const qtTitle = getters.qt.title;
      let summary;
      try {
        summary = state.data[qtTitle][phaseTitle];
      } catch (e) {
        // If that phase doesn't exist in `state.data`, leave `summary` undefined
      }
      return summary || {};
    },*/
  },
};

export default module;
