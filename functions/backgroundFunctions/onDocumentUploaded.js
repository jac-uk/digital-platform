const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin.js');
const { scanFile } = require('../actions/malware-scanning/scanFile')(config, firebase);

module.exports = functions.region('europe-west2').storage
  .object()
  .onFinalize(async (object) => {
    console.log('object', JSON.stringify(object));
    return scanFile(object.name); // file path in the bucket
  });
