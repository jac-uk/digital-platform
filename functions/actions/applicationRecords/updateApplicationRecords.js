const { getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return updateApplicationRecords;

  /**
   * updateApplicationRecords
   * Inserts candidateChecks.status and sets it to 'not requested' to enable character checks functionality for older applications
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   */
  async function updateApplicationRecords(params) {

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
    );

    // construct db commands
    const commands = [];
    let appRecordCount = 0;
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];

      if (!applicationRecord.hasOwnProperty('characterChecks')) {
        appRecordCount++;
        commands.push({
          command: 'update',
          ref: applicationRecord.ref,
          data: {
            'characterChecks.status': 'not requested',
          },
        });
      }
    }

   //write to db
    const result = await applyUpdates(db, commands);

    //return
    return result ? `Updated: ${appRecordCount} application records` : false;

  }
};
