const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const verifyChecksum = require('../actions/malware-scanning/verifyFileChecksum')(config, firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
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
