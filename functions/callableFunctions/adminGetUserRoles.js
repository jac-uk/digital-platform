import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, auth } from '../shared/admin.js';
import initUserRoles from '../actions/userRoles.js';
import initServiceSettings from '../shared/serviceSettings.js';

const  { adminGetUserRoles } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall({
  memory: '256MiB',
  enforceAppCheck: true,
},
async (request) => {
  await checkFunctionEnabled();
  if (!request.auth) {
    throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  //TODO: add role check here
  return await adminGetUserRoles();
});
