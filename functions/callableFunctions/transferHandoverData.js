import * as functions from 'firebase-functions/v1';
import { db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initTransferHandoverData from '../actions/exercises/transferHandoverData.js';
import initServiceSettings from '../shared/serviceSettings.js';

const transferHandoverData = initTransferHandoverData();
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return transferHandoverData(data);
});
