import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import checkArguments from '@jac-uk/jac-kit/helpers/helpers.js';
import initAssessments from '../actions/assessments.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { sendAssessmentRequests } = initAssessments(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.exercises.permissions.canUpdateExercises.value,
    PERMISSIONS.assessments.permissions.canReadAssessments.value,
    PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
    PERMISSIONS.notifications.permissions.canCreateNotifications.value,
  ]);

  if (!checkArguments({
    exerciseId: { required: true },
    assessmentId: { required: false },
    assessmentIds: { required: false },
    resend: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await sendAssessmentRequests(data);
});
