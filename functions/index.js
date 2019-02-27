const admin = require("firebase-admin");
const NotifyClient = require("notifications-node-client").NotifyClient

admin.initializeApp()
const functions = require("firebase-functions");
const notifyClient = new NotifyClient(functions.config().notify.key)

const sendEmail = (email, link, template, personalisation) => {
  notifyClient
    .sendEmail(template, email, personalisation)
    .then(() => console.info({ type: "verification link", email: email }))
    .catch(error => console.error(error))
}

exports.sendVerificationEmail = functions.auth.user().onCreate((user) => {
  return admin.auth().generateEmailVerificationLink(user.email)
    .then((link) => {
      return sendEmail(
        user.email,
        link,
        functions.config().notify.templates.verification,
        { personalisation: { verificationLink: link } }
      )
    })
    .catch(error => console.error(error))
});
