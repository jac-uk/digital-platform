import functions from 'firebase-functions';
import config from '../shared/config.js';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initUsers from '../actions/users.js';
import initServiceSettings from '../shared/serviceSettings.js';

const users = initUsers(auth, db, config);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    token: { required: true },
    returnUrl: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await users.createFirebaseEmailLink(data);
});