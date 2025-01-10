import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { db, auth, firebase } from '../shared/admin.js';
import { objectHasNestedProperty } from '../shared/helpers.js';
import { checkArguments } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import initSlack from '../actions/slack.js';

const { checkFunctionEnabled } = initServiceSettings(db);
const slack = initSlack(auth, config, db, firebase);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  if (!checkArguments({
    userId: { required: true },
    slackMemberId: { required: true },
    addSlackToProfile: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  const addSlackIdToUserRecord = objectHasNestedProperty(data, 'addSlackToProfile') && data.addSlackToProfile;
  return await slack.lookupSlackUser(data.userId, data.slackMemberId, addSlackIdToUserRecord);

});

