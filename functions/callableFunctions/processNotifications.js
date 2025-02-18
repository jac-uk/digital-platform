import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, firebase } from '../shared/admin.js';
import initNotifications from '../actions/notifications.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

import { defineSecret } from 'firebase-functions/params';
const NOTIFY_KEY = defineSecret('NOTIFY_KEY');

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [NOTIFY_KEY],  // ✅ Ensure the function has access to the secrets
  },
  async (request) => {

    try {
      //const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.notifications.permissions.canUpdateNotifications.value,
        PERMISSIONS.settings.permissions.canUpdateSettings.value,
      ]);

      const { processNotifications } = initNotifications(process.env.NOTIFY_KEY, firebase, db);

      return await processNotifications();
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
