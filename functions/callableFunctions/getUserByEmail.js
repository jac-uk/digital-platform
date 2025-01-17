import * as functions from 'firebase-functions/v1';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initGetUserByEmail from '../actions/candidates/getUserByEmail.js';
const  getUserByEmail  = initGetUserByEmail(auth);
import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  console.log('getUserByID called');
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    email: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await getUserByEmail(data);
});
