import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initApplicationOnUpdate from '../actions/applications/onUpdate.js';
import initLogEvent from '../actions/logs/logEvent.js';

const onApplicationUpdate = initApplicationOnUpdate(config, firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
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
