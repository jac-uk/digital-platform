const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const onQualifyingTestResponseUpdate = require('../actions/qualifyingTestResponses/onUpdate')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('qualifyingTestResponses/{qualifyingTestResponseId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onQualifyingTestResponseUpdate(dataBefore, dataAfter);
  });
