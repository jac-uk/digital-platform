const functions = require('firebase-functions');
const config = require('../shared/config');
const { storage, db } = require('../shared/admin.js');
const onPanelUpdate = require('../actions/panels/onUpdate')(config, storage, db);

const runtimeOptions = {
  timeoutSeconds: 300,
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').firestore
  .document('panels/{panelId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onPanelUpdate(context.params.panelId, dataBefore, dataAfter);
  });
