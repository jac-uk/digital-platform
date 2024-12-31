import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initServiceSettings from '../shared/serviceSettings.js';
import initVerification from '../actions/candidates/verification.js';
import { checkArguments } from '../shared/helpers.js';

const { checkFunctionEnabled } = initServiceSettings(db);
const { sendSmsCode } = initVerification(config, firebase, db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    mobile: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  const uid = context.auth.uid;
  return await sendSmsCode({ uid, mobile: data.mobile });
});
