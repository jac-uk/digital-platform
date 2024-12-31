import functions from 'firebase-functions';
import config from '../shared/config.js';
import { db } from '../shared/admin.js';
import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initZenhub from '../shared/zenhub.js';

const zenhub = initZenhub(config);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.releases.permissions.canReadReleases.value,
  ]);

  return await zenhub.getLatestReleaseForRepositories();

});

