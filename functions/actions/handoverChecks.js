const { getDocument, getDocuments, applyUpdates } = require('../shared/helpers');

module.exports = (config, firebase, db) => {

  return enableHandoverChecks;

  /**
   * enableHandoverChecks
   * Inserts candidateChecks.status and sets it to 'not requested' to enable character checks functionality for older applications
   * Sets exercise handoverChecksEnabled flag to true
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   */
  async function enableHandoverChecks(params) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(params.exerciseId));

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .where('stage', '==', 'handover')
      .where('status', '==', 'approvedForImmediateAppointment')
    );

    // construct db commands
    const commands = [];
    let appRecordCount = 0;

    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];

      if (!Object.prototype.hasOwnProperty.call(applicationRecord, 'handoverChecks')) {
        appRecordCount++;
        commands.push({
          command: 'update',
          ref: applicationRecord.ref,
          data: {
            'handoverChecks.status': 'not requested',
          },
        });
      }
    }

    // write to db
    await applyUpdates(db, commands);

    const exerciseData = {
      'handoverChecksEnabled': true,
    };

    if (!exercise.handoverChecksEnabled === true) {
      await exercise.ref.update(exerciseData);
      return true;
    }
    return false;
  }
};
