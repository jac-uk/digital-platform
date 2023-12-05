const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin');
const config = require('../shared/config');
const { onBugReportCreated } = require('../actions/bugReports')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('bugReports/{bugReportId}')
  .onCreate(async (snap, context) => {
    const bugReportId = context.params.bugReportId;
    console.log(`Bug Report created (${bugReportId})`);
    const snapData = snap.data();
    onBugReportCreated(bugReportId, snapData);
    return true;
  });
