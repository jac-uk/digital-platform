const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments, getDocument, getAllDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    exportApplicationPreferencesData,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {object} params:
   *    {uuid} exerciseId
   *    {string} stage
   */
  async function exportApplicationPreferencesData(params) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(params.exerciseId));
    if (!exercise) { return false; }

    // get submitted applications
    let applications;
    if (params.stage) {
      // get application record ids at that stage
      const applicationRecords = await getDocuments(db.collection('applicationRecords')
        .where('exercise.id', '==', params.exerciseId)
        .where('stage', '==', params.stage)
        .select()
      );
      // get applications
      const applicationRefs = applicationRecords.map(ar => db.collection('applications').doc(ar.id));
      applications = await getAllDocuments(db, applicationRefs);
    } else {
      applications = await getDocuments(db.collection('applications')
        .where('exerciseId', '==', params.exerciseId)
        .where('status', 'in', ['applied', 'withdrawn'])
      );
    }

    const headers = [
      { title: 'Reference number', id: 'referenceNumber' },
      { title: 'Status', id: 'status' },
      { title: 'Name', id: 'fullName' },
    ];
    if (exercise.locationQuestion) {
      headers.push({ title: 'Location preferences', id: 'locationPreferences' });
    }
    if (exercise.jurisdictionQuestion) {
      headers.push({ title: 'Jurisdiction preferences', id: 'jurisdictionPreferences' });
    }
    if (exercise.additionalWorkingPreferences) {
      exercise.additionalWorkingPreferences.forEach((pref, index) => headers.push({ title: pref.question, id: `additionalPreference${index}` }));
    }

    const report = {
      headers: headers,
      rows: rowData(exercise, applications),
    };

    return report;
  }
};

const rowData = (exercise, applications) => {
  return applications.map((application) => {
    if (!Object.keys(application).includes('personalDetails')) { application.personalDetails = {}; }
    const rowData = {
      referenceNumber: application.referenceNumber,
      status: lookup(application.status),
      fullName: application.personalDetails.fullName,
    };
    if (exercise.locationQuestion) {
      rowData.locationPreferences = getPreferenceValueAsString(exercise.locationQuestionType, application.locationPreferences);
    }
    if (exercise.jurisdictionQuestion) {
      rowData.jurisdictionPreferences = getPreferenceValueAsString(exercise.jurisdictionQuestionType, application.jurisdictionPreferences);
    }
    if (exercise.additionalWorkingPreferences) {
      exercise.additionalWorkingPreferences.forEach((pref, index) => {
        rowData[`additionalPreference${index}`] = getPreferenceValueAsString(pref.questionType, additionalWorkingPreferenceAnswer(application.additionalWorkingPreferences, index));
      });
    }
    return rowData;
  });
};

const getPreferenceValueAsString = (type, value) => {
  if (!value) return '';
  switch (type) {
    case 'single-choice':
      return value;
    case 'multiple-choice':
      return value.join('\n');
    case 'ranked-choice':
      return value.map((v,i) => `${i+1}: ${v}`).join('\n');
  }
  return '';
};

const additionalWorkingPreferenceAnswer = (preferences, index) => {
  let result = null;
  if (preferences) {
    if (preferences[index]) {
      result = preferences[index].selection;
    }
  }
  return result;
};
