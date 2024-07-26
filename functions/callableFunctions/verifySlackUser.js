const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { db, auth } = require('../shared/admin.js');
const { objectHasNestedProperty } = require('../shared/helpers.js');
const { checkArguments } = require('../shared/helpers.js');
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

// const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

const slack = require('../actions/slack')(auth, config, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  //console.log('Verify Slack User');

  // hasPermissions(context.auth.token.rp, [
  //   PERMISSIONS.applications.permissions.canReadApplications.value,
  //   PERMISSIONS.applications.permissions.canUpdateApplications.value,
  //   PERMISSIONS.notifications.permissions.canCreateNotifications.value,
  // ]);

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

