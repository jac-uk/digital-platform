export default (firebase, db) => {

  return {
    addLateApplicationRequest,
    removeLateApplicationRequest,
  };

  async function addLateApplicationRequest(exerciseId, candidateId) {
    const saveData = {};
    saveData['_lateApplicationRequests'] = firebase.firestore.FieldValue.arrayUnion(candidateId);
    await db.doc(`exercises/${exerciseId}`).update(saveData);
  }

  async function removeLateApplicationRequest(exerciseId, candidateId) {
    const saveData = {};
    saveData['_lateApplicationRequests'] = firebase.firestore.FieldValue.arrayRemove(candidateId);
    await db.doc(`exercises/${exerciseId}`).update(saveData);
  }
};
