import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';

export default (db) => {

  return enableCharacterChecks;

  /**
   * enableCharacterChecks
   * Inserts candidateChecks.status and sets it to 'not requested' to enable character checks functionality for older applications
   * Sets exercise characterChecksEnabled flag to true
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   */
  async function enableCharacterChecks(params) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(params.exerciseId));

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
    );

    // construct db commands
    const commands = [];
    //let appRecordCount = 0;

    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];

      if (!Object.prototype.hasOwnProperty.call(applicationRecord, 'characterChecks')) {
        //appRecordCount++;
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
    await applyUpdates(db, commands);

    const exerciseData = {
      'characterChecksEnabled': true,
    };

    if (!exercise.characterChecksEnabled === true) {
      await exercise.ref.update(exerciseData);
      return true;
    }
    return false;
  }
};
