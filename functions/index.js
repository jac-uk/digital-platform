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

const sendVerificationEmail = (email) => {
  const returnUrl = 'https://apply.judicialappointments.digital';
  return admin.auth().generateEmailVerificationLink(email, {url: returnUrl})
    .then(link => {
      const templateId = functions.config().notify.templates.verification;
      const personalisation = {
        verificationLink: link,
      };
      return sendEmail(email, templateId, personalisation);
    });
};

exports.sendVerificationEmailOnNewUser = functions.auth.user().onCreate((user) => {
  const email = user.email;
  return sendVerificationEmail(email);
});

exports.sendVerificationEmail = functions.https.onCall((data, context) => {
  const email = context.auth.token.email;
  return sendVerificationEmail(email);
});
