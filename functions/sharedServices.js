const functions = require('firebase-functions');
const admin = require('firebase-admin');

const NotifyClient = require('notifications-node-client').NotifyClient;

// This can only be invoked once in firebase functions, and this is why we have to put it here
admin.initializeApp();

const db = admin.firestore();

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

const emailIsValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
};

module.exports = {
  db,
  sendEmail,
  emailIsValid,
};
