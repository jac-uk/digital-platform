import * as functions from 'firebase-functions/v1';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initCheckEnabledUserByEmail from '../actions/candidates/checkEnabledUserByEmail.js';
import initServiceSettings from '../shared/serviceSettings.js';

const checkEnabledUserByEmail = initCheckEnabledUserByEmail(auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  if (!checkArguments({
    email: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await checkEnabledUserByEmail(data);
});
