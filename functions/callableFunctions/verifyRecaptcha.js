const functions = require('firebase-functions');
const config = require('../shared/config');
const { db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const verifyRecaptcha = require('../actions/verifyRecaptcha')(config);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    token: { required: true },
    remoteip: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await verifyRecaptcha(data);
}));

