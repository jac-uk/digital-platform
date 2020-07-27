/*
 *  To prevent this index.js from getting too big,
 *  create your functions in separate files
 */

const functions = require('firebase-functions');

exports.requestMalwareScan = functions.region('europe-west2').storage
  .object()
  .onFinalize((object) => {
    const handler = require('./virus-scanning/requestMalwareScan');
    return handler(object);
  });

// @TODO enqueueMalwareScans
