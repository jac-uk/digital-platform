const functions = require('firebase-functions');
const config = require('../shared/config');
const { db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const verfiyRecaptcha = require('../actions/verfiyRecaptcha')(config);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    token: { required: true },
    remoteip: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await verfiyRecaptcha(data);
});
