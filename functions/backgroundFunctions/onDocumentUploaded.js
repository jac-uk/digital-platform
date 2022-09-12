const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin.js');
const { scanFile } = require('../actions/malware-scanning/scanFile')(config, firebase);
const { sentry } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').storage
  .object()
  .onFinalize(sentry.GCPFunction.wrapEventFunction(async (object) => {
    console.log('object', JSON.stringify(object));
    return scanFile(object.name); // file path in the bucket
  }));
