function selectionDayTimetable(panelData, candidateInfo, reasonableAdjustments, panelConflicts) {
  const result = {
    timetable: [],
    unassignedCandidates: [],
  };

  let candidatesForPanel;

  panelData.forEach((panel) => {
    let availableSlots = panel.totalSlots;

    candidatesForPanel = candidateInfo.filter((candidate) => {
      const candidateIsAvailable = candidate.availableDates.some((date) => date.getTime() === panel.date.getTime());
      const candidateHasPanelConflict = panelConflicts.some((conflict) => conflict.candidate.id === candidate.candidate.id && panel.panellists.some((panellist) => conflict.panellist.id === panellist.id));
      return candidateIsAvailable && !candidateHasPanelConflict;
    });
    
    candidatesForPanel.forEach((candidate) => {
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
      } else {
        result.unassignedCandidates.push(candidate);
      }
    });
  });

    // Add unassigned candidates into unassigned result 
    // result.unassignedCandidates = result.unassignedCandidates.concat(candidateInfo.filter((candidate) => !candidatesForPanel.includes(candidate)));

  return result;
}

module.exports = selectionDayTimetable;
