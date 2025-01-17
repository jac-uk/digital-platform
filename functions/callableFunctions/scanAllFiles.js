import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initScanAllFiles from '../actions/malware-scanning/scanAllFiles.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { scanAllFiles } = initScanAllFiles(config, firebase);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  if (data.async === false) {
    await scanAllFiles(data.force || false, data.maxFiles || 999999);
  } else {
    scanAllFiles(data.force || false, data.maxFiles || 999999);
  }

  // return the outcome
  return true;

});
