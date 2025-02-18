export default (db) => {
  return getPreferenceData;

  async function getPreferenceData(exerciseIds) {
    let result = {};

    for (const exerciseId of exerciseIds) {
      let exerciseDataRef = db.collection('exercises').doc(exerciseId);
      const docSnapshot = await exerciseDataRef.get();

      if (!docSnapshot.exists) continue;

      const { 
        locationQuestion = null, 
        jurisdictionQuestion = null, 
        locationPreferences = null, 
        jurisdictionPreferences = null, 
        additionalWorkingPreferences = [] 
      } = docSnapshot.data();

      result[exerciseId] = {
        locationPreferences: locationPreferences,
        locationQuestion: locationQuestion,
        jurisdictionPreferences: jurisdictionPreferences,
        jurisdictionQuestion: jurisdictionQuestion,
        additionalPreferences: additionalWorkingPreferences.length ? additionalWorkingPreferences : [],
      };
    }

    return result;
  }
};
