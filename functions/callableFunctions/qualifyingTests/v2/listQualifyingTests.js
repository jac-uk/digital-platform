import * as functions from 'firebase-functions/v1';
import config from '../../../shared/config.js';
import { db } from '../../../shared/admin.js';
import { checkArguments } from '../../../shared/helpers.js';
import initQts from '../../../shared/qts.js';
import initServiceSettings from '../../../shared/serviceSettings.js';

const qts = initQts(config);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    folder: { required: true },
    test: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  await checkFunctionEnabled();

  const response = await qts.get('qualifying-tests', {
    folder: data.folder,
  });

  return response;
});
