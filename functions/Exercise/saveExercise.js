const admin = require('firebase-admin');

if (admin.apps.length == 0) {
  admin.initializeApp();  
}

const firestore = admin.firestore();
const START_AT = 200;

const saveExercise = async (data) => {
  let newRef = await createRefNumber();
  let exerciseData = {
    ...data,
    ref: newRef,
  };

  try {
    let docRef = await firestore.collection('exercises').add(exerciseData);
    console.log('Document written with ID: ', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

const createRefNumber = async () => {
  try {
    let exercisesRef = await firestore.collection('exercises').orderBy('ref', 'desc').limit(1).get();
    let exercisesData = exercisesRef.docs[0].data();
    let newRef = parseInt(exercisesData.ref) + 1;
    return `${newRef}`;
  } catch(e) {
    return START_AT;
  }  
};

module.exports = saveExercise;
