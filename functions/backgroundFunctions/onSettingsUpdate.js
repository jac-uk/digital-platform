import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db } from '../shared/admin.js';
import initOnSettingsUpdate from '../actions/settings/onUpdate.js';

const onSettingsUpdate = initOnSettingsUpdate(db);

export default onDocumentUpdated('settings/services', (event) => {
  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();
  return onSettingsUpdate(dataBefore, dataAfter);
});
