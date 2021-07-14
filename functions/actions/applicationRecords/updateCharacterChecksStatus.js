module.exports = (config, firebase, db) => {

  return updateCharacterChecksStatus;

  /**
   * updateCharacterChecksStatus
   * Updates the specified application record with the new character checks status and timestamp
   * @param {*} `params` is an object containing
   * `applicationRecordId` (required) an id of application record to update
   */
  async function updateCharacterChecksStatus(params) {
    if (params.applicationRecordId) {
      try {
        await db.collection('applicationRecords').doc(params.applicationRecordId).update({
          'characterChecks.status': 'completed',
          'characterChecks.completedAt': firebase.firestore.Timestamp.fromDate(new Date()),
        });
        return true;
      } catch (e) {
        console.error(`Error updating application record ${params.applicationRecordId}`, e);
        return false;
      }
    } else {
      return false;
    }
  }
};
