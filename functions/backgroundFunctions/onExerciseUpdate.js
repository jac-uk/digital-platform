const functions = require('firebase-functions');
const config = require('../shared/config');
const { db } = require('../shared/admin.js');
const { deleteVacancy, updateVacancy } = require('../actions/vacancies')(config, db);

module.exports = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    
    // TODO:-
    // We may need to perform more than one task/check.
    // Consider whether to do them here, in seperate cloud functions, or
    // perhaps use Pub/Sub.
    if (after.published === true) {
      if (
        before.published !== true || (
          before.published === true &&
          (before.state === 'draft' || before.state === 'ready')
        )
      ) {
        return updateVacancy(context.params.exerciseId, after);
      }
    } else if (after.published === false) {
      if (before.published === true) {
        return deleteVacancy(context.params.exerciseId);
      }
    }
    return true;
  });
