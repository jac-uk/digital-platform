const admin = require('firebase-admin');
const functions = require('firebase-functions');
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
exports.handleCandidateOnCreate = require('./candidates/handleCandidateOnCreate');
exports.handleApplicationOnCreate = require('./applications/handleApplicationOnCreate');
exports.handleApplicationOnUpdate = require('./applications/handleApplicationOnUpdate');
exports.handleExerciseTimelineDates = require('./exercises/handleExerciseTimelineDates');
exports.onExerciseUpdate_PublishVacancy = require('./exercises/onExerciseUpdate_PublishVacancy');
exports.onVacancyStatsUpdate = require('./exercises/onVacancyStatsUpdate');


/*
 *  TODO: All functions below this comment should be refactored into separate files.
 */

const sendVerificationEmail = async (user) => {
  const email = user.email;
  const returnUrl = functions.config().production.url;
  const templateId = functions.config().notify.templates.verification;
  const verificationLink = await admin.auth().generateEmailVerificationLink(email, {url: returnUrl});
  return sendEmail(email, templateId, {
    'applicantName': user.displayName,
    verificationLink,
  });
};

exports.sendVerificationEmailOnNewUser = functions.region('europe-west2').auth.user().onCreate((user) => {
  return sendVerificationEmail(user);
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
  
