import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db } from '../shared/admin.js';
import initOnPanelUpdate from '../actions/panels/onUpdate.js';

const onPanelUpdate = initOnPanelUpdate(firebase, db);

export default onDocumentUpdated({
  document: 'panels/{panelId}',
  timeoutSeconds: 300,
}, (event) => {
  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();
  return onPanelUpdate(event.params.panelId, dataBefore, dataAfter);
});
