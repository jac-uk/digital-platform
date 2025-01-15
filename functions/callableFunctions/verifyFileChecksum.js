import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import verifyChecksumInit from '../actions/malware-scanning/verifyFileChecksum.js';

const verifyChecksum = verifyChecksumInit(config, firebase, db);

export default functions
  .region('europe-west2')
  .https
  .onCall(async (data, context) => {
  const { filePath } = data;

  try {
    const result = await verifyChecksum(filePath);

    // Ensure that the result is what the frontend expects
    return {
      valid: result.valid,
      message: result.message || null,
    };
  } catch (error) {
    console.error('Error verifying checksum:', error);

    // Throw an HttpsError with a message to return a proper error response
    throw new functions.https.HttpsError('internal', error.message);
  }
});
