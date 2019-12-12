/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const db = require('../sharedServices').db;
const slog = require('../sharedServices').slog;

const sendCandidateCreatedAccountEmail = async (snap, context) => {
  const data = snap.data();
  const email = data.email;

  const candidateRef = db.collection('candidates').doc(context.params.candidateId);
  const setWithMerge = candidateRef.set({
    createdAt: Date.now(), 
    status: 'account-created',
  }, { merge: true});
  slog(`Response from setting Candidate (${context.params.candidateId}): ${setWithMerge}`);

  const personalizationData = {
    fullName: data.fullName,
  };  

  const templateId = functions.config().notify.templates.candidate_created_account;
  const sendEmailResponse = sendEmail(email, templateId, personalizationData);
  if (sendEmailResponse) {
    slog(`${email} is a new Candidate and created an account`);
    return true;
  } 
  slog(`ERROR: Sending to ${email} candidate (${context.params.candidateId}) created account email failed`);
  return null; 
};

exports.handleOnCreate = functions.firestore
  .document('candidates/{candidateId}')
  .onCreate( (snap, context) => {
    const candidateCreatedAccountEmailSent = sendCandidateCreatedAccountEmail(snap, context);
    return null;
  });
