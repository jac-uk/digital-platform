import * as functions from 'firebase-functions/v1';
import { db, auth } from '../shared/admin.js';
import initUserRoles from '../actions/userRoles.js';
import initServiceSettings from '../shared/serviceSettings.js';

const  { adminGetUserRoles } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  //TODO: add role check here
  return await adminGetUserRoles();

});

