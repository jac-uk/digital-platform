export default (db) => {

  return onUpdate;

  /**
   * Settings/Services event handler for Update
   * - if commissioners has changed then copy the latest names to `settings/candidateSettings`
   */
  async function onUpdate(dataBefore, dataAfter) {
    if (dataBefore.commissioners !== dataAfter.commissioners) {
      const saveData = {};
      saveData['commissioners'] = dataAfter.commissioners.map(item => ({ name: item.name }));
      await db.doc('settings/candidateSettings').set(saveData, { merge: true });
    }
    return true;
  }

};
