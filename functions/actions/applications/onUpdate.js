const { getDocument, applyUpdates, isDateInPast } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newApplicationRecord } = require('../../shared/factories')(config);
  const { updateCandidate } = require('../candidates/search')(firebase, db);
  //const updateCharacterChecksStatus = require('../applicationRecords/updateCharacterChecksStatus')(config, firebase, db);

  return onUpdate;

  /**
   * Application event handler for Update
   * - if status has changed update the application counts on the exercise
   */
  async function onUpdate(dataBefore, dataAfter) {
    const commands = [];
    if (dataBefore.status !== dataAfter.status) {
      // update stats if status has changed
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const exerciseId = dataBefore.exerciseId;
      const data = {};
      data[`applications.${dataBefore.status}`] = decrement;
      data[`applications.${dataAfter.status}`] = increment;
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
    const before = dataBefore.characterChecks.status;
    const after = dataAfter.characterChecks.status;

    if (!before || !after) {
      return;
    }

    if ((before !== after) && after === 'completed') {
      try {
        await db.collection('applicationRecords').doc(`${dataAfter.id}`).update({
          'characterChecks.status': 'completed',
          'characterChecks.completedAt': firebase.firestore.Timestamp.fromDate(new Date()),
        });
        return true;
      } catch (e) {
        console.error(`Error updating application record ${dataAfter.id}`, e);
        return false;
      }
    }

    return true;
  }

};
