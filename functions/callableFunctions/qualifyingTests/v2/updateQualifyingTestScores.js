const functions = require('firebase-functions');
const config = require('../../../shared/config');
const { firebase, db } = require('../../../shared/admin.js');
const { checkArguments } = require('../../../shared/helpers.js');
const updateQualifyingTestScores = require('../../../actions/qualifyingTests/v2/updateQualifyingTestScores')(config, firebase, db);
const { checkFunctionEnabled } = require('../../../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    exerciseId: { required: true },
    type: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  await checkFunctionEnabled();

  const response = await updateQualifyingTestScores(data);

  return response;
});
