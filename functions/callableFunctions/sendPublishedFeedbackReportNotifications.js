import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { sendPublishedFeedbackReportNotifications } = initApplications(config, firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!(typeof data.type === 'string') || data.type.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a type');
  }

  // Get the candidates and send the email
  return await sendPublishedFeedbackReportNotifications(data.exerciseId, data.type);

});
