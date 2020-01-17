
const functions = require('firebase-functions');
const { setData } = require('../sharedServices');

exports.onVacancyStatsUpdate = functions.region('europe-west2').firestore
  .document('vacancies/{vacancyId}/meta/stats')
  .onUpdate((change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();
    if (data.applicationsCount != previousData.applicationsCount) {
      setData('exercises', context.params.vacancyId, { applicationsCount: data.applicationsCount });
    }
  });
