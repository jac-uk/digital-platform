import functions from 'firebase-functions';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initGetUserEmailByID from '../actions/candidates/getUserEmailByID.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const  getUserEmailByID  = initGetUserEmailByID(auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  console.log('getUserByID called');
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // Function is called when updating a candidate in Admin
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.candidates.permissions.canUpdateCandidates.value,
  ]);

  if (!checkArguments({
    candidateId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await getUserEmailByID(data);

});
