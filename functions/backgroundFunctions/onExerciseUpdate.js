const functions = require('firebase-functions');
const config = require('../shared/config');
const { db } = require('../shared/admin.js');
const { deleteVacancy, updateVacancy } = require('../actions/vacancies')(config, db);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after.published === true) {
      return updateVacancy(context.params.exerciseId, after);
    } else if (after.published === false) {
      if (before.published === true) {
        return deleteVacancy(context.params.exerciseId);
      }
    }
    return true;
  });
