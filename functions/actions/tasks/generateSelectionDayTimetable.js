import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import selectionDayTimetable from './selectionDayTimetable.js';

export default (db) => {
  return generateSelectionDayTimetable;

  async function generateSelectionDayTimetable(exerciseId) {
    const selectionDayTask = await getDocument(db.collection('exercises').doc(exerciseId).collection('tasks').doc('selectionDay'));
    const panels = await getDocuments(db.collection('panels').where('exercise.id', '==', exerciseId));
    const panelData = panels.map(panel => ({
      panel: { id: panel.id },
      panellists: panel.panellistIds.map(panellistId => ({ id: panellistId })),
      timetable: panel.timetable.map(slot => ({
        date: slot.date.toDate(),
        totalSlots: slot.totalSlots,
      })),
    }));
    const candidateFormResponses = await getDocuments(db.collection('candidateForms').doc(selectionDayTask._preSelectionDayQuestionnaire.formId).collection('responses'));
    const candidateInfo = candidateFormResponses.map(response => ({
      candidate: { id: response.id },
      availableDates: response.candidateAvailability.availableDays.map(availableDay => availableDay.date.toDate()),
    }));
    const applications = await Promise.all(candidateFormResponses.map(async (response) => {
      const application = await getDocument(db.collection('applications').doc(response.applicationId));
      return application;
    }));
    const reasonableAdjustments = applications
      .filter(application => application.personalDetails.reasonableAdjustments)
      .map(application => application.id);
    const panelConflicts = candidateFormResponses.map(response => ({
      candidate: { id: response.id },
      panellists: response.panelConflicts && response.panelConflicts.panelConflicts
        ? response.panelConflicts.panelConflicts.filter(panelConflict => panelConflict.hasRelationship).map(panelConflict => ({ id: panelConflict.id }))
        : [],
    }));
    const result = await selectionDayTimetable(panelData, candidateInfo, reasonableAdjustments, panelConflicts);
    const commands = [];
    commands.push({
      command: 'update',
      ref: db.collection('exercises').doc(exerciseId).collection('tasks').doc('selectionDay'),
      data: result,
    });
    await applyUpdates(db, commands);
    return result;
  }
};
