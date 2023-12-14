module.exports = (config, firebase, db) => {

  return onUpdate;

  /**
   * Settings/Services event handler for Update
   * - if commissioners has changed then copy the latest names to `settings/candidateData`
   */
  async function onUpdate(dataBefore, dataAfter) {
    if (dataBefore.commissioners !== dataAfter.commissioners) {
      const saveData = {};
      saveData['commissioners'] = dataAfter.commissioners.map(item => ({ name: item.name }));
      await db.doc('settings/candidateData').set(saveData, { merge: true });
    }
    return true;
  }

};
