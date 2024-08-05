const functions = require('firebase-functions');
const verifyChecksum = require('../actions/malware-scanning/verifyFileChecksum');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  const { filePath } = data;
  return await verifyChecksum(filePath);
});
