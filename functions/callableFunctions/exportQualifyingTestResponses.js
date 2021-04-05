const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { exportQualifyingTestResponses } = require('../actions/qualifyingTestResponses/export')(firebase, db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.qualifyingTestId === 'string') || data.qualifyingTestId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "qualifyingTestId"');
  }

  // log an event
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(data.qualifyingTestId));
  let details = {
    qualifyingTestId: qualifyingTest.id,
    qualifyingTestTitle: qualifyingTest.title,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Qualifying test responses exported', details, user);

  // return the requested data
  return await exportQualifyingTestResponses(data.qualifyingTestId);

});
