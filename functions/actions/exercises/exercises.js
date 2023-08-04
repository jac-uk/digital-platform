module.exports = (db) => {
  return {
    updateExercise,
  };

  /**
   * Update exercise document with the provided ID and data
   */
  async function updateExercise(exerciseId, data) {

    console.log('***** updateExercise...');
    console.log(`exerciseId: ${exerciseId}`);
    console.log('data:');
    console.log(data);

    try {
      await db.collection('exercises').doc(exerciseId).set(data, { merge: true });
      return true;
    } catch (e) {
      console.error(`Error writing exercise ${exerciseId}`, e);
      return false;
    }
  }
};
