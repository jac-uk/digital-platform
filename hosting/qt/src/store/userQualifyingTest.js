import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";
import merge from 'deepmerge';

let unsubscribe;

const firestoreCollection = () => {
  return firestore.collection('usersQualifyingTests');
};

const commitSnapshot = (commit, snapshot) => {
  if (snapshot.exists) {
    let data = snapshot.data();
    delete data.userUid;
    delete data.test;
    data = sanitizeFirestore(data);
    commit('setUserQualifyingTest', {id: snapshot.id, data});
  } else {
    commit('clearUserQualifyingTest');
  }
};

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    clearUserQualifyingTest(state) {
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
      const results = await firestoreCollection()
        .where('test', '==', getters.testDoc)
        .where('userUid', '==', getters.currentUserId)
        .get();

      if (results.empty) {
        commit('clearUserQualifyingTest');
      } else {
        const snapshot = results.docs[0];
        commitSnapshot(commit, snapshot);
      }
    },
    subscribeUserQualifyingTest({commit, getters}) {
      if (typeof unsubscribe == 'function') return; // Don't subscribe again if already subscribed
      unsubscribe = getters.userQualifyingTestDoc.onSnapshot((snapshot) => {
        if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          commitSnapshot(commit, snapshot);
        }
      });
    },
    unsubscribeUserQualifyingTest() {
      if (typeof unsubscribe === 'function') unsubscribe();
      unsubscribe = undefined; // Reset so we can subscribe again
    },
    async startQualifyingTest({commit, getters}) {
      const data = {
        startedAt: new Date(),
      };

      const saveData = {
        test: getters.testDoc,
        userUid: getters.currentUserId,
        ...data
      };

      const doc = getters.userQualifyingTestDoc;
      await doc.set(saveData, {merge: true});
      commit('updateUserQualifyingTest', {id: doc.id, data});
    },
  },
  getters: {
    userQualifyingTest: (state) => {
      return state.data;
    },
    userQualifyingTestDoc: (state) => {
      if (state.id) {
        return firestoreCollection().doc(state.id);
      }
      return firestoreCollection().doc();
    },
    userHasStartedTest: (state) => {
      return !!(state.data.startedAt);
    },
    userHasFinishedTest: (state) => {
      return !!(state.data.startedAt && state.data.finishedAt);
    },
    qualifyingTestFormUrl: (state, getters) => {
      const formUrl = getters.test.googleFormsUrl + state.id;
      return state.id ? formUrl : null;
    },
  },
};

export default module;
