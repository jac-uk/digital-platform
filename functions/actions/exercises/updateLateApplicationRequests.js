const { FieldValue } = require('firebase-admin/firestore');

module.exports = (db) => {

  return {
    addLateApplicationRequest,
    removeLateApplicationRequest,
  };

  async function addLateApplicationRequest(exerciseId, candidateId) {
    const saveData = {};
    saveData['_lateApplicationRequests'] = FieldValue.arrayUnion(candidateId);
    await db.doc(`exercises/${exerciseId}`).update(saveData);
  }

  async function removeLateApplicationRequest(exerciseId, candidateId) {
    const saveData = {};
    saveData['_lateApplicationRequests'] = FieldValue.arrayRemove(candidateId);
    await db.doc(`exercises/${exerciseId}`).update(saveData);
  }
};
