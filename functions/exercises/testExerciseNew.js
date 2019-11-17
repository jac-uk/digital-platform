const functions = require('firebase-functions');

const db = require('../sharedServices').db;

const testExerciseNew = (req, res) => {
  console.log("triggered testExerciseNew");

  // Add a new document in collection "exercises"
  return db.collection("exercises").doc(Date.now().toString()).set({
    name: "Dummy New Exercise. Delete me!",
    exerciseMailbox: "martin.raymundo@judicialappointments.digital",
    createdAt: Date.now(),
  })
  .then(function() {
    console.log("Document successfully written!");
    return true;
  })
  .catch(function(error) {
    console.error("Error writing document: ", error);
  });
};

module.exports = testExerciseNew;