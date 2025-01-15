import * as functions from 'firebase-functions/v1';
import config from '../../shared/config.js';
import { firebase, db } from '../../shared/admin.js';
import { checkArguments } from '../../shared/helpers.js';
import initUpdateTask from '../../actions/tasks/updateTask.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { updateTask } = initUpdateTask(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 180,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.tasks.permissions.canUpdate.value,
  ]);

  if (!checkArguments({
    exerciseId: { required: true },
    type: { required: true },
    nextStage: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await updateTask(data);
  return result;
});
