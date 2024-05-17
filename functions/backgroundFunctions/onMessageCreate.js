const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, auth } = require('../shared/admin');
const { onMessageCreate } = require('../actions/messages')(config, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('messages/{messageId}')
  .onCreate((snap, context) => {
    const messageId = context.params.messageId;
    return onMessageCreate(messageId, snap.data());
  });
