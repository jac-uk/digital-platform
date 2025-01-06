import config from '../../shared/config.js';
import functions from 'firebase-functions';
import { auth, firebase, db } from '../../shared/admin.js';
import { checkArguments } from '../../shared/helpers.js';
import initUpdateEmailAddress from '../../actions/candidates/updateEmailAddress.js';
import initServiceSettings from '../../shared/serviceSettings.js';

const updateEmailAddress = initUpdateEmailAddress(config, auth, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    currentEmailAddress: { required: true },
    newEmailAddress: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  console.log('Calling updateEmailAddress ...');

  return await updateEmailAddress(data);

});
