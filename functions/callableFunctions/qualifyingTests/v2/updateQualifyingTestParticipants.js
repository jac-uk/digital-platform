const functions = require('firebase-functions');
const config = require('../../../shared/config');
const { db } = require('../../../shared/admin.js');
const { checkArguments } = require('../../../shared/helpers.js');
const updateQualifyingTestParticipants = require('../../../actions/qualifyingTests/v2/updateQualifyingTestParticipants')(config, db);
const { checkFunctionEnabled } = require('../../../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    exerciseId: { required: true },
    type: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  await checkFunctionEnabled();

  const response = await updateQualifyingTestParticipants(data);

  return response;
});
