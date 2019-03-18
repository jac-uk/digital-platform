const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require("notifications-node-client").NotifyClient;

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
  const user = await admin.auth().getUser(applicantId)
  const templateId = functions.config().notify.templates.application_started;
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
