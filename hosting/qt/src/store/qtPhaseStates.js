const module = {
  state: {},
  mutations: {},
  actions: {},
  getters: {
    qtPhaseCanBeStarted: (state, getters) => (phaseTitle) => {
      const previousPhase = getters.qtPhaseBefore(phaseTitle);
      return (
        getters.qtIsOpen &&
        (
          !previousPhase ||
          getters.qtPhaseHasBeenFinished(previousPhase.title)
        ) &&
        !getters.qtPhaseHasBeenStarted(phaseTitle)
      );
    },
    qtPhaseHasBeenStarted: (state, getters) => (phaseTitle) => {
      const summary = getters.qtPhaseSummary(phaseTitle);
      return !!(summary.startedAt);
    },
    qtPhaseHasBeenFinished: (state, getters) => (phaseTitle) => {
      const summary = getters.qtPhaseSummary(phaseTitle);
      return (summary.startedAt && summary.finishedAt);
    },
    qtPhaseFormUrl: (state, getters) => (phaseTitle) => {
      const phase = getters.qtPhase(phaseTitle);
      if (!phase) return null;
      return phase.form_url + getters.currentUserId;
    },
    allQtPhasesFinished: (state, getters) => {
      const qt = getters.qt;
      if (!qt.phases) return false;

      let allComplete = true;
      qt.phases.forEach((phase) => {
        if (!getters.qtPhaseHasBeenFinished(phase.title)) {
          allComplete = false;
        }
      });
      return allComplete;
    },
  },
};

export default module;
