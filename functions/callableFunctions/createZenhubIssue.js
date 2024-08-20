import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initCreateIssue from '../actions/zenhub/createIssue.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { createIssue } = initCreateIssue(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  // Validate @judicialappointments.gov.uk and @judicialappointments.digital
  const validEmailPattern = /@judicialappointments\.gov\.uk$|@judicialappointments\.digital$/;
  if (!validEmailPattern.test(context.auth.token.email)) {
    throw new functions.https.HttpsError('failed-precondition', 'The function is restricted to JAC Staff.');
  }
  return await createIssue(data.bugReportId, data.userId);
});

