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
      console.info(JSON.parse(JSON.stringify(notifyResponse)));
      return true;
    });
};

const sendVerificationEmail = (email) => {
  return admin.auth().generateEmailVerificationLink(email)
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
