import * as functions from 'firebase-functions/v1';
import { db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initGetPreferenceData from '../actions/exercises/getPreferenceData.js';

const getPreferenceData = initGetPreferenceData(db);

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
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  if (!checkArguments({
    exerciseIds: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return getPreferenceData(data.exerciseIds);

});

