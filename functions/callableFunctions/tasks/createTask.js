import functions from 'firebase-functions';
import config from '../../shared/config.js';
import { firebase, db } from '../../shared/admin.js';
import checkArguments from '@jac-uk/jac-kit/helpers/helpers.js';
import initCreateTask from '../../actions/tasks/createTask.js';
import initServiceSettings from '../../shared/serviceSettings.js';

const createTask = initCreateTask(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 180,
  memory: '256MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    exerciseId: { required: true },
    type: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await createTask(data);
  return result;
});
