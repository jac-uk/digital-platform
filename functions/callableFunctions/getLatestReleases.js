const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { db, auth } = require('../shared/admin.js');
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');
const zenhub = require('../shared/zenhub')(config);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.releases.permissions.canReadReleases.value,
  ]);

  return await zenhub.getLatestReleaseForRepositories();

});

