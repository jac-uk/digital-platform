function filterEligibleCandidates(candidate, panel, panelConflicts) {
  const candidateIsAvailable = candidate.availableDates.some((date) => date.getTime() === panel.date.getTime());
  const candidateHasPanelConflict = panelConflicts.some((conflict) =>
    conflict.candidate.id === candidate.candidate.id &&
    panel.panellists.some((panellist) => conflict.panellist.id === panellist.id)
  );

  return candidateIsAvailable && !candidateHasPanelConflict;
}

function selectionDayTimetable(panelData, candidateInfo, reasonableAdjustments, panelConflicts) {
  const result = {
    timetable: [],
    unassignedCandidates: [],
  };

  let unassignedCandidates = candidateInfo.slice(); // Make a copy to avoid modifying the original array

  panelData.forEach((panel) => {
    let availableSlots = panel.totalSlots;

    // Filter out candidates who are not available or have conflicts
    const eligibleCandidates = unassignedCandidates.filter((candidate) =>
      filterEligibleCandidates(candidate, panel, panelConflicts)
    );

    eligibleCandidates.forEach((candidate) => {
      if (availableSlots > 0) {
        const row = {
          Panel: panel.panel.id,
          Date: panel.date,
          Slot: panel.totalSlots - availableSlots + 1,
          CandidateRef: candidate.candidate.id,
          ReasonableAdjustment: reasonableAdjustments.includes(candidate.candidate.id),
        };
        availableSlots--;
        result.timetable.push(row);

        // Remove assigned candidate from unassignedCandidates
        unassignedCandidates = unassignedCandidates.filter(
          (unassignedCandidate) => unassignedCandidate.candidate.id !== candidate.candidate.id
        );
      }
    });
  });

  result.unassignedCandidates = unassignedCandidates;

  return result;
}

module.exports = selectionDayTimetable;
