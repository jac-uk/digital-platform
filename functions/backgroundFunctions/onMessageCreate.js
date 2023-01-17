const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin');
const { onMessageCreate } = require('../actions/messages')(config, firebase, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('messages/{messageId}')
  .onCreate((snap, context) => {
    //const messageId = context.params.messageId;
    const message = snap.data();

    let candidateId = null;
    let msgType = null;
    let exerciseId = null;

    if (message.type) {
      msgType = message.type;
      candidateId = message[msgType].candidateId;
      exerciseId = message[msgType].exerciseId;
    }
    
    return onMessageCreate(msgType, exerciseId, candidateId);
  });
