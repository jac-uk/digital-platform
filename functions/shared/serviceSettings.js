import { https } from 'firebase-functions/v2';
import { getDocument } from './helpers.js';

export default (db) => {
  return {
    serviceSettings,
    checkFunctionEnabled,
  };

  async function serviceSettings() {
    const services = await getDocument(db.doc('settings/services'));
    return services;
  }

  async function checkFunctionEnabled(name) {
    const services = await serviceSettings();
    if (!services.functions.enabled) {
      throw new https.HttpsError('unavailable', 'This function is not available');
    }
    return;
  }
};
