const functions = require('firebase-functions');
const config = require('../shared/config');
const { sentry } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onCreate(sentry.GCPFunction.wrapEventFunction((snap, context) => {
    const exerciseId = context.params.exerciseId;
    console.log(`Exercise created (${exerciseId})`);
  }));
