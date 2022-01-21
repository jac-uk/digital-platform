const { getDocument, applyUpdates, isDateInPast } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newApplicationRecord } = require('../../shared/factories')(config);
  const { updateCandidate } = require('../candidates/search')(firebase, db);

  return onUpdate;

  /**
   * Application event handler for Update
   * - if status has changed update the application counts on the exercise
   * - if application characterChecks.status changed, update application record
   */
  async function onUpdate(applicationId, dataBefore, dataAfter) {
    const commands = [];
    if (dataBefore.status !== dataAfter.status) {
      // update stats if status has changed
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const exerciseId = dataBefore.exerciseId;
      const data = {};
      console.log(`Update application counts: _applications.${dataBefore.status} decrease; _applications.${dataAfter.status} increase`);
      data[`_applications.${dataBefore.status}`] = decrement;
      data[`_applications.${dataAfter.status}`] = increment;
      data['_applications._lastUpdated'] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.doc(`exercises/${exerciseId}`),
        data: data,
      });
      await applyUpdates(db, commands);

      // update candidate document
      await updateCandidate(dataAfter.userId);
      // update application record

      // // applied
      // if (dataAfter.status === 'applied') {
      //   const exercise = getDocument(db.doc(`exercises/${exerciseId}`));
      //   if (exercise.state === 'approved') {
      //     if (isDateInPast(exercise.applicationCloseDate)) {  // exercise is now closed
      //       // ensure an applicationRecord document is created
      //       commands.push({
      //         command: 'set',
      //         ref: db.collection('applicationRecords').doc(`${dataAfter.id}`),
      //         data: newApplicationRecord(exercise, dataAfter),
      //       });
      //     }
      //   }
      // }
    }

    const characterChecksBefore = dataBefore.characterChecks;
    const characterChecksAfter = dataAfter.characterChecks;

    if (characterChecksBefore && characterChecksAfter && characterChecksBefore.status && characterChecksAfter.status) {
      if ((characterChecksBefore.status !== characterChecksAfter.status) && characterChecksAfter.status === 'completed') {
        try {
          await db.collection('applicationRecords').doc(`${applicationId}`).update({
            'characterChecks.status': 'completed',
            'characterChecks.completedAt': firebase.firestore.Timestamp.fromDate(new Date()),
          });
          return true;
        } catch (e) {
          console.error(`Error updating application record ${applicationId}`, e);
          return false;
        }
      }
    }
    return true;
  }
};
