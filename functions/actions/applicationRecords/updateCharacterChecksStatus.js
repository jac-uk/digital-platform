const { getDocument, getDocuments, applyUpdates, getDocumentsFromQueries } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return updateCharacterChecksStatus;

  /**
   * setApplicationRecordCharacterChecksStatus
   * Updates specified applications records with the new character checks status
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   *   `referenceNumbers` (required) array of application record reference numbers
   *   `newStatus` (required) new status to update application records to have
   */
  async function updateCharacterChecksStatus(params) {

    let applicationRecords = [];

    // get application records from reference numbers
    if (params.referenceNumbers && params.referenceNumbers.length) {
      const queries = params.referenceNumbers.map(referenceNumber => {
        console.log('r', referenceNumber);
        console.log('r2', params.exerciseId);
        return db.collection('applicationRecords')
          .where('exercise.id', '==', params.exerciseId)
          .where('application.id', '==', referenceNumber)
          .select('ref');
      });
      applicationRecords = await getDocumentsFromQueries(queries);
      console.log(applicationRecords);
    }

    //construct db commands
    const commands = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      commands.push({
        command: 'update',
        ref: applicationRecord.ref,
        data: {
          'characterChecks.status': params.status,
          'characterChecks.requestedAt': firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    console.log('result', result);
    // return
    return result ? applicationRecords.length : false;

  }

};
