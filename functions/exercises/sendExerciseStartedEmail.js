/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;

const sendExerciseStartedEmail = async (snap, context) => {
    const data = snap.data();
    const email = data.exerciseMailbox;
    const templateId = functions.config().notify.templates.exercise_started;
    return sendEmail(email, templateId, {}).then((sendEmailResponse) => {
      console.info(email + ' has created an Exercise.');
      return true;
    });
  };

module.exports = sendExerciseStartedEmail;
