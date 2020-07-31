
const functions = require('firebase-functions');
const { setData } = require('../sharedServices');

exports.onWriteVacancyStats = functions.region('europe-west2').firestore
  .document('vacancies/{vacancyId}/meta/stats')
  .onWrite((change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after && after.applicationsCount && (!before || before.applicationsCount !== after.applicationsCount)) {
      setData('exercises', context.params.vacancyId, { applicationsCount: after.applicationsCount });
    }
  });
