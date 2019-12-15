/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const db = require('../sharedServices').db;
const slog = require('../sharedServices').slog;

exports.sendExerciseStartedEmail = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onCreate( (snap, context) => {
    const data = snap.data();
    const email = data.exerciseMailbox;

    // set createdAt attribute here instead of receiving it from the Vue apply app 
    const exerciseRef = db.collection('exercises').doc(context.params.exerciseId);
    const setWithMerge = exerciseRef.set({
      createdAt: Date.now(), 
    }, { merge: true});

    const templateId = functions.config().notify.templates.exercise_started;
    return sendEmail(email, templateId, {}).then((sendEmailResponse) => {
      slog(`${email} has created an Exercise (${context.params.exerciseId})`);
      return true;
    });
  });
