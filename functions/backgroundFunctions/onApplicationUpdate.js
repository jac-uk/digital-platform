const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { onApplicationUpdate } = require('../actions/applications/applications')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onApplicationUpdate(dataBefore, dataAfter);
  });
