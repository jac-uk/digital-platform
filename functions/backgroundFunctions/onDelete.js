import functions from 'firebase-functions/v1';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { logEvent } = initLogEvent(firebase, db, auth);

// This function is triggered when records are deleted in firestore.
// The purpose is to archive, not delete data from the database.
// When a record is deleted, this function will take a copy and insert it into `{collectionName}_deleted`

export default functions.region('europe-west2').firestore
  .document('{collection}/{documentId}')
  .onDelete((snap, context) => {

    const collectionName = context.params.collection;
    const deletedRecord = snap.data();

    //check if record is already deleted - if so, do nothing
    if (deletedRecord.deletedAt) {
      return false;
    }

    deletedRecord.deletedAt = firebase.firestore.Timestamp.fromDate(new Date());

    const detail = {
      collection: collectionName,
      documentId: snap.id,
    };

    logEvent('info', collectionName + ' record deleted', detail);

    // e.g. `applications` collections becomes `applications_deleted`
    const collectionDeletedName = context.params.collection + '_deleted';

    return db.collection(collectionDeletedName).doc(snap.id).set(deletedRecord);

  });

