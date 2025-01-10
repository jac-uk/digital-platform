import * as functions from 'firebase-functions/v1';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initUsers from '../actions/users.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { updateUserCustomClaims } = initUsers(auth, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    userId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await updateUserCustomClaims(data.userId);

});
