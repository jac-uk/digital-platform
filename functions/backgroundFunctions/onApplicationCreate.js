const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { onApplicationCreate } = require('../actions/applications/applications')(config, firebase, db);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onCreate((snap, context) => {

    const application = snap.data();

    const details = {
      applicationId: context.params.applicationId,
      candidateName: application.personalDetails ? application.personalDetails.fullName : null,
      exerciseRef: application.exerciseRef,
    };

    logEvent('info', 'Application created', details);

    return onApplicationCreate(snap.ref, snap.data());
  });
