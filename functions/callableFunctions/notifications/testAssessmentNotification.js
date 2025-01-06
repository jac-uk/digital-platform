import functions from 'firebase-functions';
import config from '../../shared/config.js';
import { firebase, db } from '../../shared/admin.js';
import { checkArguments } from '../../shared/helpers.js';
import initAssessments from '../../actions/assessments.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { testAssessmentNotification } = initAssessments(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.assessments.permissions.canReadAssessments.value,
  ]);

  if (!checkArguments({
    assessmentIds: { required: true },
    notificationType: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await testAssessmentNotification({
    assessmentIds: data.assessmentIds,
    notificationType: data.notificationType,
    email: context.auth.token.email,
  });
  return {
    result: result,
  };
});
