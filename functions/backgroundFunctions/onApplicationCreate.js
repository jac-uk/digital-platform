const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { onApplicationCreate } = require('../actions/applications/applications')(config, firebase, db);
const { logEvent }  = require('../actions/logs/logEvent');

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onCreate((snap, context) => {

    const application = snap.data();
    const detail = {
      id: applicationId,
      candidateName: application.personalDetails.fullName,
      exerciseRef: application.exerciseRef,
    };

    logEvent('info', 'Application created', detail, null);

    return onApplicationCreate(snap.ref, snap.data());
  });
