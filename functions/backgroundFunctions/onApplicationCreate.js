const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { onApplicationCreate } = require('../actions/applications/applications')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onCreate((snap, context) => {
    return onApplicationCreate(snap.ref, snap.data());
  });
