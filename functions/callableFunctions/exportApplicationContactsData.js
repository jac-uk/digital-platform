const functions = require('firebase-functions');
const { firebase, db, auth } = require('../shared/admin.js');
const { exportApplicationContactsData } = require('../actions/exercises/exportApplicationContactsData')(firebase, db);
const { getDocument, checkArguments } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.runWith({
  timeoutSeconds: 180,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
    status: { required: true },
    processingStage: { required: false },
    processingStatus: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
    status: data.status,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Application contacts exported', details, user);

  // return the requested data
  return await exportApplicationContactsData({
    exerciseId: data.exerciseId,
    status: data.status,
    processingStage: data.processingStage,
    processingStatus: data.processingStatus,
  });

});
