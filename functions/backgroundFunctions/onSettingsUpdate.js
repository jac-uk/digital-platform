const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const onSettingsUpdate = require('../actions/settings/onUpdate')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('settings/services')
  .onUpdate((change) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onSettingsUpdate(dataBefore, dataAfter);
  });
