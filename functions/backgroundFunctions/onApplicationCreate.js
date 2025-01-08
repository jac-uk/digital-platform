import functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onApplicationCreate } = initApplications(config, firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
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
