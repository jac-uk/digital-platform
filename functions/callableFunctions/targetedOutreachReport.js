import functions from 'firebase-functions';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initTargetedOutreachReport from '../actions/exercises/targetedOutreachReport.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { targetedOutreachReport } = initTargetedOutreachReport(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.candidates.permissions.canReadCandidates.value,
  ]);

  if (!checkArguments({
    nationalInsuranceNumbers: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await targetedOutreachReport(data.nationalInsuranceNumbers);
  return result;
});
