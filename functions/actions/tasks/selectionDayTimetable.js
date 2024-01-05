function selectionDayTimetable(panelData, candidateInfo, reasonableAdjustments, panelConflicts) {
  const result = {
    timetable: [],
    unassignedCandidates: [],
  };

  // Initialize suitableCandidates on panels
  panelData.forEach((panel) => {
    const panelDate = panel.date;
    // Initialize suitableCandidates with candidates without conflicts and available on the date
    panel.suitableCandidates = candidateInfo
      .filter((candidate) => {
        // Check for conflicts
        const hasConflict = panelConflicts.some((conflict) =>
          conflict.candidate.id === candidate.candidate.id &&
          panel.panellists.some((panellist) => conflict.panellist.id === panellist.id)
        );

        // Check for availability on the date
        const isAvailable = candidate.availableDates.some((date) => date.getTime() === panelDate.getTime());

        return !hasConflict && isAvailable;
      })
      .map((candidate) => candidate.candidate.id);
  });

  // Initialize suitablePanels on candidates
  candidateInfo.forEach((candidate) => {
    candidate.suitablePanels = panelData
      .filter((panel) => {
        // Check for conflicts
        const hasConflict = panelConflicts.some((conflict) =>
          conflict.candidate.id === candidate.candidate.id &&
          panel.panellists.some((panellist) => conflict.panellist.id === panellist.id)
        );

        // Check for availability on the date
        const isAvailable = candidate.availableDates.some((date) => date.getTime() === panel.date.getTime());

        return !hasConflict && isAvailable;
      })
      .map((panel) => panel.panel.id);
  });

  // Assign candidates to slots
  panelData.forEach((panel) => {
    let availableSlots = panel.totalSlots;

    // For candidates available for only one date
    const oneDateCandidates = panel.suitableCandidates.filter((candidateId) => {
      const candidate = candidateInfo.find((c) => c.candidate.id === candidateId);
      return candidate.availableDates.length === 1 && candidate.availableDates[0].getTime() === panel.date.getTime();
    });

    oneDateCandidates.forEach((candidate) => {
      if (availableSlots > 0) {

        const assignedCandidate = candidateInfo.find((c) => c.candidate.id === candidate);

        // Assign the candidate to the slot
        const row = {
          Panel: panel.panel.id,
          Date: panel.date,
          Slot: panel.totalSlots - availableSlots + 1,
          CandidateRef: candidate,
          ReasonableAdjustment: reasonableAdjustments.includes(candidate),
        };

        availableSlots--;

        result.timetable.push(row);

        // Remove assigned candidate from suitableCandidates
        panel.suitableCandidates = panel.suitableCandidates.filter((candidateId) => candidateId !== candidate);
        // Add sorted flag to candidate on candidateInfo array (for determining unassigned candidates)
        assignedCandidate.sorted = true;
      }
    });

    // For candidates available for multiple dates
    const multiDateCandidates = panel.suitableCandidates.filter((candidateId) => {
      const candidate = candidateInfo.find((c) => c.candidate.id === candidateId);
      return (
        candidate.availableDates.length > 1 &&
        candidate.availableDates.some((date) => date.getTime() === panel.date.getTime())
      );
    });

    if (multiDateCandidates.length) {
      multiDateCandidates.forEach((candidate) => {
        if (availableSlots > 0) {

          const assignedCandidate = candidateInfo.find((c) => c.candidate.id === candidate);
          
          // Assign the candidate to the slot
          const row = {
            Panel: panel.panel.id,
            Date: panel.date,
            Slot: panel.totalSlots - availableSlots + 1,
            CandidateRef: candidate,
            ReasonableAdjustment: reasonableAdjustments.includes(candidate),
          };

          availableSlots--;

          result.timetable.push(row);

          // Remove assigned candidate from suitableCandidates
          panel.suitableCandidates = panel.suitableCandidates.filter((candidateId) => candidateId !== candidate);
          // Add sorted flag to candidate on candidateInfo array (for determining unassigned candidates)
          assignedCandidate.sorted = true;
        }
      });
    }
  });

  // Collect unassigned candidates
  candidateInfo.forEach((candidate) => {
    if (!candidate.sorted) {
      result.unassignedCandidates.push(candidate);
    }
  });

  return result;
}

module.exports = selectionDayTimetable;
