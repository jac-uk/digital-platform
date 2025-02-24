import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import initOnPanelUpdate from '../actions/panels/onUpdate.js';

const onPanelUpdate = initOnPanelUpdate(process.env.STORAGE_URL, firebase, db);

const runtimeOptions = {
  timeoutSeconds: 300,
};

export default functions.runWith(runtimeOptions).region('europe-west2').firestore
  .document('panels/{panelId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onPanelUpdate(context.params.panelId, dataBefore, dataAfter);
  });
