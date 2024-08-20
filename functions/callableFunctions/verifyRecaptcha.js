import functions from 'firebase-functions';
import config from '../shared/config.js';
import { db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initVerifyRecaptcha from '../actions/verifyRecaptcha.js';
import initServiceSettings from '../shared/serviceSettings.js';

const verifyRecaptcha = initVerifyRecaptcha(config);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    token: { required: true },
    remoteip: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await verifyRecaptcha(data);
});
