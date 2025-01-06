import functions from 'firebase-functions';
import { db, auth } from '../../shared/admin.js';
import initUserRoles from '../../actions/userRoles.js';
import initServiceSettings from '../../shared/serviceSettings.js';

const  { adminGetUsers } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  //TODO: add role check here
  return await adminGetUsers();

});

