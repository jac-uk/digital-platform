const admin = require('firebase-admin');
const functions = require('firebase-functions');

const firestore = admin.firestore();
const REF_START_AT = 200;

const createExercise = async (data, context) => {
  let userEmail = context.auth.token.email;
  if(userEmail.split('@').pop() !== 'judicialappointments.digital') {
    throw new functions.https.HttpsError('authentication failed', `The function has been called from ${userEmail} account`);
  }

  let newRef = await createRefNumber();
  let exerciseData = {
    name: data.name,
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
    return newRef;
  } catch(e) {
    return REF_START_AT;
  }  
};

module.exports = createExercise;
