import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import selectionDayTimetable from './selectionDayTimetable.js';

export default (db) => {
  return generateSelectionDayTimetable;

  async function generateSelectionDayTimetable(exerciseId) {
    try {
      const selectionDayTask = await getDocument(db.collection('exercises').doc(exerciseId).collection('tasks').doc('selectionDay'));
      const panels = await getDocuments(db.collection('panels').where('exercise.id', '==', exerciseId));
      const panelData = panels.map(panel => ({
        panel: {
          id: panel.id,
          name: panel.name,
        },
        panellists: panel.panellistIds.map(panellistId => ({ id: panellistId })),
        applicationIds: panel.applicationIds,
        timetable: panel.timetable.map(slot => ({
          date: slot.date.toDate(),
          totalSlots: slot.totalSlots,
        })),
      }));
      const candidateFormResponses = await getDocuments(db.collection('candidateForms').doc(selectionDayTask._preSelectionDayQuestionnaire.formId).collection('responses'));
      const candidateInfo = candidateFormResponses.map(response => ({
        candidate: {
          id: response.id,
        },
        application: {
          id: response.applicationId,
        },
        availableDates: response.candidateAvailability.availableDays.map(availableDay => availableDay.date.toDate()),
      }));
      const applications = await Promise.all(candidateFormResponses.map(async (response) => {
        const application = await getDocument(db.collection('applications').doc(response.applicationId));
        candidateInfo.forEach(candidate => {
          if (candidate.candidate.id === response.id) {
            candidate.application.ref = application ? application.referenceNumber : null;
            candidate.application.fullName = application ? application.personalDetails.fullName : null;
          }
        });
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
    } catch (error) {
      console.error('Error generating selection day timetable', error);
      return false;
    }
  }
};
