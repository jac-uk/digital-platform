const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require("notifications-node-client").NotifyClient;
const qtSubmission = require("./qt/submission");

admin.initializeApp();

const sendEmail = (email, templateId, personalisation) => {
  const client = new NotifyClient(functions.config().notify.key);

  console.info({
    action: 'Sending email',
    email,
    templateId,
    personalisation,
  });

  return client
    .sendEmail(
      templateId,
      email,
      {personalisation}
    )
    .then(notifyResponse => {
      console.info(notifyResponse.body);
      return true;
    });
};

const sendVerificationEmail = async (email) => {
  const returnUrl = functions.config().production.url;
  const templateId = functions.config().notify.templates.verification;
  const verificationLink = await admin.auth().generateEmailVerificationLink(email, {url: returnUrl});
  return sendEmail(email, templateId, {verificationLink});
}

const sendApplicationStartedEmail = async (applicantId) => {
  const user = await admin.auth().getUser(applicantId);
  const templateId = functions.config().notify.templates.application_started;
  return sendEmail(user.email, templateId, {});
}

const sendApplicationSubmittedEmail = async (applicantId) => {
  const user = await admin.auth().getUser(applicantId);
  const templateId = functions.config().notify.templates.application_submitted;
  return sendEmail(user.email, templateId, {});
}

exports.sendVerificationEmailOnNewUser = functions.auth.user().onCreate((user) => {
  const email = user.email;
  return sendVerificationEmail(email);
});

exports.sendVerificationEmail = functions.https.onCall((data, context) => {
  const email = context.auth.token.email;
  return sendVerificationEmail(email);
});

exports.sendApplicationStartedEmail = functions.firestore
  .document('applicants/{userId}')
  .onCreate((snap, context) => {
    return sendApplicationStartedEmail(context.params.userId);
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

exports.qtSubmissions = functions.https.onRequest((request, response) => {
  qtSubmission.createRecord(request.body)
    .then(() => {
      return response.status(200).send({status: 'OK'});
    })
    .catch((e) => {
      console.error(e);
      return response.status(500).send({status: 'Error'});
    });
});
