module.exports = (config, firebase, db) => {
  return onUpdate;

  /**
   * Qualifying Test Response event handler for Update
   * - if status has changed to started or completed update counts in qualifyingTest
   */
  async function onUpdate(dataBefore, dataAfter) {
    if (dataBefore.status !== dataAfter.status) {
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const qualifyingTestId = dataBefore.qualifyingTest.id;
      const data = {};
      const statusBefore = dataBefore.status;
      const statusAfter = dataAfter.status;
      // started test
      if (
        statusBefore === config.QUALIFYINGTESTRESPONSES_STATUS.ACTIVATED &&
        statusAfter === config.QUALIFYINGTESTRESPONSES_STATUS.STARTED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data[`counts.inProgress`] = increment;
      }
      // completed test
      if (
        statusBefore === config.QUALIFYINGTESTRESPONSES_STATUS.STARTED &&
        statusAfter === config.QUALIFYINGTESTRESPONSES_STATUS.COMPLETED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data[`counts.inProgress`] = decrement;
      }
      if (Object.keys(data).length > 0) {
        await db.doc(`qualifyingTests/${qualifyingTestId}`).update(data);
      }
    }
    return true;
  }

}
