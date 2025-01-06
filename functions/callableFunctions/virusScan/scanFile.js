import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initScanFile from '../actions/malware-scanning/scanFile.js';
import initServiceSettings from '../shared/serviceSettings.js';

const scanFile = initScanFile(config, firebase);

const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.fileURL === 'string') || data.fileURL.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a fileURL');
  }

  // run the virus scan
  const result = await scanFile(data.fileURL);

  // return the outcome
  return result;

});
