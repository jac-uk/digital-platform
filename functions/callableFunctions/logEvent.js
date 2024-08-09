import functions from 'firebase-functions';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.type === 'string') || data.type.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an event type');
  }
  let validEventTypes = ['info', 'error', 'warning'];
  if (!validEventTypes.includes(data.type)) {
    throw new functions.https.HttpsError('invalid-argument', 'The event type is invalid');
  }
  if (!(typeof data.description === 'string') || data.description.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an event description');
  }

  if (typeof data.details !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify the event details');
  }

  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name || null, // name might not be set
    email: context.auth.token.email || null,
  };

  // generate the report
  const result = await logEvent(data.type, data.description, data.details, user);
  return {
    result: result,
  };

});
