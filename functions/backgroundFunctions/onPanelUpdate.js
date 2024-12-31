import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initOnPanelUpdate from '../actions/panels/onUpdate.js';

const onPanelUpdate = initOnPanelUpdate(config, firebase, db);

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
