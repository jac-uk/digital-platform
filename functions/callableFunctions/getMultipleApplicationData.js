import functions from 'firebase-functions';
import { auth } from '../shared/admin.js';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initGetMultipleApplicationData from '../actions/exercises/getMultipleApplicationData.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const getMultipleApplicationData = initGetMultipleApplicationData(config, firebase, db, auth);
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

  if (!checkArguments({
    exerciseIds: { required: true },
    columns: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return getMultipleApplicationData(data.exerciseIds, data.params);

});

