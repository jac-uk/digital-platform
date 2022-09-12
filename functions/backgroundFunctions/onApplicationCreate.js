const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin');
const { onApplicationCreate } = require('../actions/applications/applications')(config, firebase, db, auth);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);
const { sentry } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onCreate(sentry.GCPFunction.wrapEventFunction((snap, context) => {

    const application = snap.data();

    const details = {
      applicationId: context.params.applicationId,
      candidateName: application.personalDetails ? application.personalDetails.fullName : null,
      exerciseRef: application.exerciseRef,
    };

    logEvent('info', 'Application created', details);

    return onApplicationCreate(snap.ref, snap.data());
  }));
