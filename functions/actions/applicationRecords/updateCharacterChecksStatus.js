const { applyUpdates, getDocumentsFromQueries } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return updateCharacterChecksStatus;

  /**
   * updateCharacterChecksStatus
   * Updates specified applications records with the new character checks status
   * @param {*} `params` is an object containing
   *   `referenceNumbers` (required) array of application record reference numbers
   *   `newStatus` (required) new status to update application records to have
   */
  async function updateCharacterChecksStatus(params) {

    let applicationRecords = [];

    // get application records from reference numbers
    if (params.referenceNumbers && params.referenceNumbers.length) {
      const queries = params.referenceNumbers.map(referenceNumber => {
        return db.collection('applicationRecords')
          .where('exercise.id', '==', params.exerciseId)
          .where('application.id', '==', referenceNumber)
          .select('ref');
      });
      applicationRecords = await getDocumentsFromQueries(queries);
    }
    let field = '';
    switch (params.status) {
      case 'requested':
        field = 'characterChecks.requestedAt';
        break;
      case 'reminder sent':
        field = 'characterChecks.reminderSentAt';
        break;
      case 'completed':
        field = 'characterChecks.completedAt';
        break;
      case null || undefined:
        throw new Error('Error');
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
            [field]: firebase.firestore.Timestamp.fromDate(new Date()),
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    // return
    return result ? applicationRecords.length : false;

  }

};
