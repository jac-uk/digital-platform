const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { firebase, db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { generateOutreachReport } = require('../actions/exercises/generateOutreachReport')(config, firebase, db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // generate the report
  const result = await generateOutreachReport(data.exerciseId);

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
  await logEvent('info', 'Outreach report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };
});
