const functions = require('firebase-functions');
const { firebase, db, auth } = require('../shared/admin.js');
const { generateAgencyReport } = require('../actions/exercises/generateAgencyReport')(firebase, db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');
const config = require('../shared/config');
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }

  // generate the report
  const result = await generateAgencyReport(data.exerciseId);

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Agency report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };

}));
