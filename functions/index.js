const admin = require("firebase-admin");
const NotifyClient = require('notifications-node-client').NotifyClient

admin.initializeApp()
const functions = require("firebase-functions");

exports.sendVerificationEmail = functions.auth.user().onCreate((user) => {
  const notifyClient = new NotifyClient(functions.config().notify.key)
  const email = user.email
  const displayName = user.displayName

  const sendEmail = (link) => {
    notifyClient
      .sendEmail(
        functions.config().notify.templates.verification,
        email,
        { personalisation: { verificationLink: link } }
      )
      .then(() => console.info({ type: "verification Link", email: email }))
      .catch(error => console.error(error))
  }

  return admin.auth().generateEmailVerificationLink(email)
    .then(link => sendEmail(link))
    .catch(error => console.error(error))
});
