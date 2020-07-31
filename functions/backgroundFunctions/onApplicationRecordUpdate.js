const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { onApplicationRecordUpdate } = require('../actions/applicationRecords')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('applicationRecords/{applicationRecordId}')
  .onUpdate(async (change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onApplicationRecordUpdate(dataBefore, dataAfter);
  });
