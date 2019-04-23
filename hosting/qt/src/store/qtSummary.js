import {firestore} from "@/firebase";
import sanitizeFirestore from "@/utils/sanitizeFirestore";
import merge from 'deepmerge';

let unsubscribe;

const loadSnapshot = (commit, snapshot) => {
  if (snapshot.exists) {
    const data = sanitizeFirestore(snapshot.data());
    commit('setQtSummary', data);
  } else {
    commit('setQtSummary', {});
  }
};

const module = {
  state: {
    data: {},
  },
  mutations: {
    setQtSummary(state, data) {
      state.data = data;
    },
    updateQtSummary(state, data) {
      state.data = merge(state.data, data);
    },
  },
  actions: {
    async loadQtSummary({commit, getters}) {
      const snapshot = await getters.qtSummaryDoc.get();
      loadSnapshot(commit, snapshot);
    },
    subscribeQtSummary({commit, getters}) {
      if (typeof unsubscribe == 'function') return; // Don't subscribe again if already subscribed
      unsubscribe = getters.qtSummaryDoc.onSnapshot((snapshot) => {
        if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          loadSnapshot(commit, snapshot);
        }
      });
    },
    unsubscribeQtSummary() {
      if (typeof unsubscribe === 'function') unsubscribe();
      unsubscribe = undefined; // Reset so we can subscribe again
    },
    async startQtPhase({commit, getters}, phaseTitle) {
      const qtTitle = getters.qt.title;
      const now = new Date();
      const saveData = {
        [qtTitle]: {
          [phaseTitle]: {
            startedAt: now
          }
        }
      };
      await getters.qtSummaryDoc.set(saveData, {merge: true});
      commit('updateQtSummary', saveData);
    },
  },
  getters: {
    qtSummaryDoc: (state, getters) => {
      if (getters.currentUserId) {
        return firestore.collection('qtSummaries').doc(getters.currentUserId);
      }
      return null;
    },
    qtPhaseSummary: (state, getters) => (phaseTitle) => {
      const qtTitle = getters.qt.title;
      let summary;
      try {
        summary = state.data[qtTitle][phaseTitle];
      } catch (e) {
        // If that phase doesn't exist in `state.data`, leave `summary` undefined
      }
      return summary || {};
    },
  },
};

export default module;
