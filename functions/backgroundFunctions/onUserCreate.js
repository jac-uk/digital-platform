const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin');
const { onUserCreate } = require('../actions/users')(config, firebase, db, auth);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const details = {
      userId: context.params.userId,
    };

    logEvent('info', 'Application created', details);
    return onUserCreate(snap.ref, snap.data());
  });
