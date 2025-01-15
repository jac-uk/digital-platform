import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initOnSettingsUpdate from '../actions/settings/onUpdate.js';

const onSettingsUpdate = initOnSettingsUpdate(config, firebase, db);

export default functions.region('europe-west2').firestore
  .document('settings/services')
  .onUpdate((change) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onSettingsUpdate(dataBefore, dataAfter);
  });
