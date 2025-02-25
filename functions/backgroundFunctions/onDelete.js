import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { logEvent } = initLogEvent(firebase, db, auth);

// This function is triggered when records are deleted in firestore.
// The purpose is to archive, not delete data from the database.
// When a record is deleted, this function will take a copy and insert it into `{collectionName}_deleted`

export default onDocumentDeleted('{collection}/{documentId}', (event) => {
  const snap = event.data;
  const collectionName = event.params.collection;
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
  const collectionDeletedName = collectionName + '_deleted';

  return db.collection(collectionDeletedName).doc(snap.id).set(deletedRecord);

});

