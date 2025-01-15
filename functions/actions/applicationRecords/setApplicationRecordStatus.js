import { applyUpdates, getDocumentsFromQueries } from '../../shared/helpers.js';

export default (config, firebase, db) => {

  return setApplicationRecordStatus;

  /**
  * setApplicationRecordStatus
  * Updates specified applications records with the new status
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `referenceNumbers` (required) array of application reference numbers
  *   `newStatus` (required) new status to update application records to have
  * TODO support `applicationRecordsIds` array
  */
  async function setApplicationRecordStatus(params) {

    let applicationRecords = [];

    // get application records from reference numbers
    if (params.referenceNumbers && params.referenceNumbers.length) {
      const queries = params.referenceNumbers.map(referenceNumber => {
        return db.collection('applicationRecords')
          .where('exercise.id', '==', params.exerciseId)
          .where('application.referenceNumber', '==', referenceNumber)
          .select('application.id');
      });
      applicationRecords = await getDocumentsFromQueries(queries);
    }

    // construct db commands
    const commands = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      commands.push({
        command: 'update',
        ref: applicationRecord.ref,
        data: {
          status: params.newStatus,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? applicationRecords.length : false;

  }

};
