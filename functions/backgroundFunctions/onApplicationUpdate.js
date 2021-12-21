const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const onApplicationUpdate = require('../actions/applications/onUpdate')(config, firebase, db);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    const applicationId = context.params.applicationId;

    if (dataBefore.status !== dataAfter.status) {
      const detail = {
        applicationId: applicationId,
        candidateName: dataAfter.personalDetails.fullName,
        exerciseRef: dataAfter.exerciseRef,
        oldStatus: dataBefore.status,
        newStatus: dataAfter.status,
      };
      logEvent('info', 'Application status changed', detail);
    }

    return onApplicationUpdate(applicationId, dataBefore, dataAfter);
  });
