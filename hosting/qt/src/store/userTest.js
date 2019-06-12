import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";
import merge from 'deepmerge';

let unsubscribe;

const firestoreCollection = () => {
  return firestore.collection('usersTests');
};

const commitSnapshot = (commit, snapshot) => {
  if (snapshot.exists) {
    let data = snapshot.data();
    delete data.userUid;
    delete data.test;
    data = sanitizeFirestore(data);
    commit('setUserTest', {id: snapshot.id, data});
  } else {
    commit('clearUserTest');
  }
};

const module = {
  state: {
    id: null,
    data: {},
  },
  mutations: {
    clearUserTest(state) {
      state.id = null;
      state.data = {};
    },
    setUserTest(state, {id, data}) {
      state.id = id;
      state.data = data;
    },
    updateUserTest(state, {id, data}) {
      state.id = id;
      state.data = merge(state.data, data);
    },
  },
  actions: {
    async loadUserTest({commit, getters}) {
      const results = await firestoreCollection()
        .where('test', '==', getters.testDoc)
        .where('userUid', '==', getters.currentUserId)
        .get();

      if (results.empty) {
        commit('clearUserTest');
      } else {
        const snapshot = results.docs[0];
        commitSnapshot(commit, snapshot);
      }
    },
    subscribeUserTest({commit, getters}) {
      if (typeof unsubscribe == 'function') return; // Don't subscribe again if already subscribed
      unsubscribe = getters.userTestDoc.onSnapshot((snapshot) => {
        if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          commitSnapshot(commit, snapshot);
        }
      });
    },
    unsubscribeUserTest() {
      if (typeof unsubscribe === 'function') unsubscribe();
      unsubscribe = undefined; // Reset so we can subscribe again
    },
    async startTest({commit, getters}) {
      const data = {
        startedAt: new Date(),
      };

      const saveData = {
        test: getters.testDoc,
        userUid: getters.currentUserId,
        ...data
      };

      const doc = getters.userTestDoc;
      await doc.set(saveData, {merge: true});
      commit('updateUserTest', {id: doc.id, data});
    },
  },
  getters: {
    userTestDoc: (state) => {
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
    testFormUrl: (state, getters) => {
      const formUrl = getters.test.googleFormsUrl + state.id;
      return state.id ? formUrl : null;
    },
  },
};

export default module;
