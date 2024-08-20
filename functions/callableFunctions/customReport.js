import functions from 'firebase-functions';
import { auth } from '../shared/admin.js';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initCustomReport from '../actions/exercises/customReport.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { customReport } = initCustomReport(config, firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  return customReport(data, context);
});
