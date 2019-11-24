/*eslint-disable no-unused-vars*/
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const NotifyClient = require('notifications-node-client').NotifyClient;
exports.userTestSubmissions = require('./qt/submission');
exports.backupFirebaseAuthentication = require('./backup/authentication');
exports.backupFirestore = require('./backup/firestore');

/*
 *  To prevent this index.js from getting too big,
 *  create your functions in separate files
 */

const sendEmail = require('./sharedServices').sendEmail;

exports.sendExerciseStartedEmail = require('./exercises/sendExerciseStartedEmail');
exports.handleExerciseMailboxChange = require('./exercises/handleExerciseMailboxChange');
exports.handleApplicationOnCreate = require('./applications/handleApplicationOnCreate');

/*
 *  TODO: All functions below this comment should be refactored into separate files.
 */

const sendVerificationEmail = async (email) => {
  const returnUrl = functions.config().production.url;
  const templateId = functions.config().notify.templates.verification;
  const verificationLink = await admin.auth().generateEmailVerificationLink(email, {url: returnUrl});
  return sendEmail(email, templateId, {verificationLink});
};

const sendApplicationSubmittedEmail = async (applicantId) => {
  const user = await admin.auth().getUser(applicantId);
  const templateId = functions.config().notify.templates.application_submitted;
  return sendEmail(user.email, templateId, {});
};

exports.sendVerificationEmailOnNewUser = functions.auth.user().onCreate((user) => {
  const email = user.email;
  return sendVerificationEmail(email);
});

exports.sendVerificationEmail = functions.https.onCall((data, context) => {
  const email = context.auth.token.email;
  return sendVerificationEmail(email);
});

exports.sendApplicationSubmittedEmail = functions.firestore
  .document('applications/{applicationId}')
  .onUpdate((change, context) => {
    const data = change.after.data();
    if (data.state === 'submitted') {
      return sendApplicationSubmittedEmail(data.applicant.id);
    }
    return true;
  });

exports.processReferenceUpload = functions.storage
  .object()
  .onFinalize((object) => {
    const regex = /^references\/.*\/.*$/;
    if (regex.test(object.name)) {
      const handler = require('./src/references/processUpload');
      return handler(object);
    }
    return true;
  });

exports.sendReferenceRequestEmail = functions.firestore
  .document('references/{referenceId}')
  .onCreate((snapshot) => {
    const config = functions.config();
    const templateId = config.notify.templates.reference_request;
    const data = snapshot.data();

    const downloadUrl = `${config.references.url}/download-form/128.docx`;
    const uploadUrl = `${config.references.url}/?ref=${snapshot.id}`;

    const personalisation = {
      'applicant name': data.applicant_name,
      'assessor name': data.assessor.name,
      'download url': downloadUrl,
      'upload url': uploadUrl,
    };

    return sendEmail(data.assessor.email, templateId, personalisation);
  });
  
