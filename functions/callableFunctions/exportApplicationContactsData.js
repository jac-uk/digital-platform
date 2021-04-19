const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { exportApplicationContactsData } = require('../actions/exercises/exportApplicationContactsData')(firebase, db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!(typeof data.status === 'string') || data.status.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a "status"');
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
  return await exportApplicationContactsData(data.exerciseId, data.status);

});
