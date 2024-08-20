import functions from 'firebase-functions';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initUsers from '../actions/users.js';
import initServiceSettings from '../shared/serviceSettings.js';

const users = initUsers(auth, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    ref: { required: true },
    email: { required: true },
    returnUrl: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await users.generateSignInWithEmailLink(data.ref, data.email, data.returnUrl);
  return {
    result: result,
  };
});
