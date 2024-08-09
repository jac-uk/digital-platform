import { applyUpdates } from '../../shared/helpers.js';

export default (config, firebase, db, auth) => {

  return onUpdate;

  /**
   * Event handler for Update
   */
  async function onUpdate(docId, dataBefore, dataAfter) {
    const commands = [];
    if (dataBefore.status !== dataAfter.status && dataAfter.applicationId && dataAfter.taskType) {
      const saveData = {};
      saveData[`${dataAfter.taskType}.status`] = dataAfter.status;
      saveData[`${dataAfter.taskType}.statusLog.${dataAfter.status}`] = firebase.firestore.FieldValue.serverTimestamp(),
      commands.push({
        command: 'update',
        ref: db.doc(`applicationRecords/${dataAfter.applicationId}`),
        data: saveData,
      });
      await applyUpdates(db, commands);
    }
    return true;
  }

};
