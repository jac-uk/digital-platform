const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const onPanelUpdate = require('../actions/panels/onUpdate')(config, firebase, db);
const { sentry } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').firestore
  .document('panels/{panelId}')
  .onUpdate(sentry.GCPFunction.wrapEventFunction((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onPanelUpdate(context.params.panelId, dataBefore, dataAfter);
  }));
