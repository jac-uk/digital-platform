const functions = require('firebase-functions');
const config = require('../../../shared/config');
const { db } = require('../../../shared/admin.js');
const { checkArguments } = require('../../../shared/helpers.js');
const qts = require('../../../shared/qts')(config);
const { checkFunctionEnabled } = require('../../../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    folder: { required: true },
    test: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  await checkFunctionEnabled();

  const response = await qts.get('qualifying-tests', {
    folder: data.folder,
  });

  return response;
});
