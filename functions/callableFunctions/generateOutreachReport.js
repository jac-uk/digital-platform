import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initGenerateOutreachReport from '../actions/exercises/generateOutreachReport.js';
import { getDocument } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { generateOutreachReport } = initGenerateOutreachReport(config, firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // generate the report
  const result = await generateOutreachReport(data.exerciseId);

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Outreach report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };
});
