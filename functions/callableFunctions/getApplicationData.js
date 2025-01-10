import * as functions from 'firebase-functions/v1';
import { auth } from '../shared/admin.js';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initGetApplicationData from '../actions/exercises/getApplicationData.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const getApplicationData = initGetApplicationData(config, firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

const runtimeOptions = {
  memory: '512MB',
};

export default functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  // if (!checkArguments({
  //   exerciseId: { required: true },
  // }, data)) {
  //   throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  // }
  return getApplicationData(data);
});
