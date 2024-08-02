const functions = require('firebase-functions');
const verifyChecksum = require('../actions/malware-scanning/verifyFileChecksum');

exports.verifyFileChecksum = functions.https.onCall(async (data, context) => {
  const { filePath } = data;
  return await verifyChecksum(filePath);
});
