import * as functions from 'firebase-functions/v1';
import config from '../../../shared/config.js';
import { firebase, db } from '../../../shared/admin.js';
import { checkArguments } from '../../../shared/helpers.js';
import initUpdateQualifyingTestParticipants from '../../../actions/qualifyingTests/v2/updateQualifyingTestParticipants.js';
import initServiceSettings from '../../../shared/serviceSettings.js';

const updateQualifyingTestParticipants = initUpdateQualifyingTestParticipants(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
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
