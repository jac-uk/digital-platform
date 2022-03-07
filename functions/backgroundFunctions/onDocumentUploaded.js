const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin.js');
const { scanFile } = require('../actions/malware-scanning/scanFile')(config, firebase);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').storage
  .object()
  .onFinalize(async (object) => {
    console.log('object', JSON.stringify(object));
    return scanFile(object.name); // file path in the bucket
  });
